import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, doc, onSnapshot, setDoc, updateDoc, collection, deleteDoc } from '../firebase/config';
import { createInitialTripState } from '../utils/defaultData';
import { generateId, generateTripCode } from '../utils/idUtils';

const TripContext = createContext();

const getClientId = () => {
  let cid = sessionStorage.getItem('voyageur_client_id');
  if (!cid) {
    cid = 'user_' + Math.random().toString(36).substring(2, 9);
    sessionStorage.setItem('voyageur_client_id', cid);
  }
  return cid;
};

export function TripProvider({ children }) {
  // Extract tripId from URL hash (e.g. #trip=ABCDEF) or default to 'voyageur-default'
  const getInitialTripId = () => {
    const hash = window.location.hash;
    if (hash && hash.includes('trip=')) {
      const match = hash.match(/trip=([A-Za-z0-9_-]+)/);
      if (match && match[1]) return match[1];
    }
    return 'voyageur-default';
  };

  const [tripId, setTripId] = useState(getInitialTripId);
  const [tripData, setTripData] = useState(() => {
    const local = localStorage.getItem(`voyageur_trip_${tripId}`);
    if (local) {
      try { return JSON.parse(local); } catch (e) {}
    }
    return createInitialTripState("Voyageur Vacation");
  });

  // User Profile for this device/session
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('voyageur_user_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const cid = getClientId();
    return {
      id: cid,
      name: 'Me',
      avatar: 'M',
      color: 'bg-indigo-600'
    };
  });

  const [activeMembers, setActiveMembers] = useState([userProfile]);
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [activePlacementActivity, setActivePlacementActivity] = useState(null);

  // Real-time Presence System
  useEffect(() => {
    localStorage.setItem('voyageur_user_profile', JSON.stringify(userProfile));

    if (db) {
      const presenceRef = collection(db, 'trips', tripId, 'presence');
      const myDocRef = doc(presenceRef, userProfile.id);

      const sendHeartbeat = () => {
        setDoc(myDocRef, {
          id: userProfile.id,
          name: userProfile.name || 'Companion',
          avatar: (userProfile.avatar || userProfile.name || 'M').charAt(0).toUpperCase(),
          color: userProfile.color || 'bg-indigo-600',
          lastSeen: Date.now()
        }, { merge: true }).catch(err => console.warn("Presence heartbeat error:", err));
      };

      sendHeartbeat();
      const heartbeatInterval = setInterval(sendHeartbeat, 10000);

      const unsubscribePresence = onSnapshot(presenceRef, (snapshot) => {
        const now = Date.now();
        const memberMap = new Map();

        // Always put current user first
        memberMap.set(userProfile.id, userProfile);

        snapshot.docs.forEach(docSnap => {
          const data = docSnap.data();
          if (data && data.lastSeen && (now - data.lastSeen < 45000)) {
            memberMap.set(data.id, {
              id: data.id,
              name: data.name || 'Companion',
              avatar: data.avatar || (data.name ? data.name.charAt(0).toUpperCase() : 'C'),
              color: data.color || 'bg-emerald-600',
              isOnline: true
            });
          }
        });

        setActiveMembers(Array.from(memberMap.values()));
      }, (err) => {
        console.warn("Presence listener fallback:", err);
      });

      return () => {
        clearInterval(heartbeatInterval);
        unsubscribePresence();
        deleteDoc(myDocRef).catch(() => {});
      };
    } else {
      setActiveMembers([userProfile]);
    }
  }, [tripId, userProfile]);

  // Sync state to local storage & Firestore subscription
  useEffect(() => {
    // Save to LocalStorage fallback
    localStorage.setItem(`voyageur_trip_${tripId}`, JSON.stringify(tripData));

    // Try Firestore real-time listener if db is available
    if (db) {
      const docRef = doc(db, 'trips', tripId);
      const unsubscribe = onSnapshot(
        docRef, 
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setTripData(data);
            setIsCloudSynced(true);
          } else {
            // First time creating this trip doc in Firestore
            setDoc(docRef, tripData)
              .then(() => setIsCloudSynced(true))
              .catch(err => console.warn("Firestore setDoc fallback:", err));
          }
        },
        (error) => {
          console.warn("Firestore subscription using local mode:", error);
          setIsCloudSynced(false);
        }
      );
      return () => unsubscribe();
    }
  }, [tripId]);

  // Persist local changes to Firestore if connected
  const persistState = (newTripData) => {
    setTripData(newTripData);
    localStorage.setItem(`voyageur_trip_${tripId}`, JSON.stringify(newTripData));

    if (db && isCloudSynced) {
      const docRef = doc(db, 'trips', tripId);
      setDoc(docRef, newTripData).catch(err => console.warn("Firestore sync error:", err));
    }
  };

  // --- ACTIONS ---
  const setTripName = (name) => {
    const updated = { ...tripData, tripName: name };
    persistState(updated);
  };

  const setTripDates = (startDate, endDate) => {
    const updated = { ...tripData, startDate, endDate };
    persistState(updated);
  };

  const addActivity = (activity) => {
    const newAct = {
      id: generateId('act'),
      title: activity.title,
      category: activity.category || 'sightseeing',
      duration: Number(activity.duration) || 1,
      location: activity.location || { name: '', address: '', mapUrl: '' },
      websiteUrl: activity.websiteUrl || '',
      notes: activity.notes || '',
      upvotes: [],
      isScheduled: false,
      dateStr: '',
      startHour: 0,
      color: activity.category === 'dining' ? 'amber' : activity.category === 'transport' ? 'sky' : 'emerald'
    };
    const updated = {
      ...tripData,
      activities: [...tripData.activities, newAct]
    };
    persistState(updated);
  };

  const toggleUpvoteActivity = (activityId) => {
    const userId = userProfile.id;
    const updatedActivities = (tripData.activities || []).map(act => {
      if (act.id === activityId) {
        const currentUpvotes = act.upvotes || [];
        const hasUpvoted = currentUpvotes.includes(userId);
        const newUpvotes = hasUpvoted
          ? currentUpvotes.filter(id => id !== userId)
          : [...currentUpvotes, userId];
        return { ...act, upvotes: newUpvotes };
      }
      return act;
    });
    persistState({ ...tripData, activities: updatedActivities });
  };

  const updateActivity = (id, updatedFields) => {
    const updatedActivities = tripData.activities.map(act => 
      act.id === id ? { ...act, ...updatedFields } : act
    );
    persistState({ ...tripData, activities: updatedActivities });
  };

  const deleteActivity = (id) => {
    const updatedActivities = tripData.activities.filter(act => act.id !== id);
    persistState({ ...tripData, activities: updatedActivities });
  };

  const scheduleActivity = (activityId, dateStr, startHour) => {
    const updatedActivities = tripData.activities.map(act => {
      if (act.id === activityId) {
        return {
          ...act,
          isScheduled: true,
          dateStr: dateStr,
          startHour: Number(startHour)
        };
      }
      return act;
    });
    persistState({ ...tripData, activities: updatedActivities });
    setActivePlacementActivity(null);
  };

  const unscheduleActivity = (activityId) => {
    const updatedActivities = tripData.activities.map(act => {
      if (act.id === activityId) {
        return {
          ...act,
          isScheduled: false,
          dateStr: '',
          startHour: 0
        };
      }
      return act;
    });
    persistState({ ...tripData, activities: updatedActivities });
  };

  const addTravelDetail = (detail) => {
    const newDetail = {
      id: generateId(detail.type === 'flight' ? 'flt' : 'lodg'),
      ...detail
    };
    persistState({
      ...tripData,
      travelDetails: [...(tripData.travelDetails || []), newDetail]
    });
  };

  const updateTravelDetail = (id, updatedFields) => {
    const updatedList = (tripData.travelDetails || []).map(item => 
      item.id === id ? { ...item, ...updatedFields } : item
    );
    persistState({ ...tripData, travelDetails: updatedList });
  };

  const deleteTravelDetail = (id) => {
    const updatedList = (tripData.travelDetails || []).filter(item => item.id !== id);
    persistState({ ...tripData, travelDetails: updatedList });
  };

  // Saved Trips Registry
  const [savedTrips, setSavedTrips] = useState(() => {
    const saved = localStorage.getItem('voyageur_saved_trips');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [{
      id: tripId,
      name: tripData.tripName || "Voyageur Vacation",
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      lastVisited: Date.now()
    }];
  });

  // Keep current trip registered in savedTrips & sync with Firestore
  useEffect(() => {
    const entry = {
      id: tripId,
      name: tripData.tripName || "Voyageur Trip",
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      lastVisited: Date.now()
    };

    setSavedTrips(prev => {
      const idx = prev.findIndex(t => t.id === tripId);
      let updated;
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = { ...updated[idx], ...entry };
      } else {
        updated = [entry, ...prev];
      }
      localStorage.setItem('voyageur_saved_trips', JSON.stringify(updated));

      // Push index to Firestore user document
      if (db) {
        const userTripsDoc = doc(db, 'users', userProfile.id, 'saved_trips', 'userIndex');
        setDoc(userTripsDoc, { trips: updated }, { merge: true }).catch(() => {});
      }
      return updated;
    });
  }, [tripId, tripData.tripName, tripData.startDate, tripData.endDate, userProfile.id]);

  // Firestore listener for user's saved trips index across devices
  useEffect(() => {
    if (db) {
      const userTripsDoc = doc(db, 'users', userProfile.id, 'saved_trips', 'userIndex');
      const unsubscribe = onSnapshot(userTripsDoc, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && Array.isArray(data.trips) && data.trips.length > 0) {
            setSavedTrips(data.trips);
            localStorage.setItem('voyageur_saved_trips', JSON.stringify(data.trips));
          }
        }
      });
      return () => unsubscribe();
    }
  }, [userProfile.id]);

  const createNewTrip = (name, startDate, endDate, customCode) => {
    const newId = customCode || generateTripCode();
    const newTrip = createInitialTripState(name || "New Voyageur Trip");
    if (startDate) newTrip.startDate = startDate;
    if (endDate) newTrip.endDate = endDate;

    setTripId(newId);
    window.location.hash = `trip=${newId}`;
    persistState(newTrip);
  };

  const switchTrip = (newId) => {
    const clean = (newId || '').trim().replace(/[^A-Za-z0-9_-]+/g, '');
    if (clean) {
      setTripId(clean);
      window.location.hash = `trip=${clean}`;
    }
  };

  const removeSavedTrip = (idToRemove) => {
    const updated = savedTrips.filter(t => t.id !== idToRemove);
    setSavedTrips(updated);
    localStorage.setItem('voyageur_saved_trips', JSON.stringify(updated));
    if (db) {
      const userTripsDoc = doc(db, 'users', userProfile.id, 'saved_trips', 'userIndex');
      setDoc(userTripsDoc, { trips: updated }, { merge: true }).catch(() => {});
    }
  };

  const forceCloudSync = async () => {
    if (!db) {
      setIsCloudSynced(false);
      return { success: false, reason: "Firebase App not initialized" };
    }
    try {
      const docRef = doc(db, 'trips', tripId);
      await setDoc(docRef, tripData, { merge: true });

      const userTripsDoc = doc(db, 'users', userProfile.id, 'saved_trips', 'userIndex');
      await setDoc(userTripsDoc, { trips: savedTrips }, { merge: true });

      setIsCloudSynced(true);
      return { success: true };
    } catch (err) {
      console.warn("Force cloud sync error:", err);
      setIsCloudSynced(false);
      return { success: false, reason: err?.message || String(err) };
    }
  };

  const updateUserProfile = (name, avatar, color) => {
    const updated = {
      ...userProfile,
      name: name || 'Me',
      avatar: (avatar || name || 'M').charAt(0).toUpperCase(),
      color: color || userProfile.color || 'bg-indigo-600'
    };
    setUserProfile(updated);
    localStorage.setItem('voyageur_user_profile', JSON.stringify(updated));
  };

  return (
    <TripContext.Provider value={{
      tripId,
      tripData,
      userProfile,
      activeMembers,
      savedTrips,
      isCloudSynced,
      activePlacementActivity,
      setActivePlacementActivity,
      setTripName,
      setTripDates,
      addActivity,
      toggleUpvoteActivity,
      updateActivity,
      deleteActivity,
      scheduleActivity,
      unscheduleActivity,
      addTravelDetail,
      updateTravelDetail,
      deleteTravelDetail,
      createNewTrip,
      switchTrip,
      removeSavedTrip,
      updateUserProfile,
      forceCloudSync
    }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  return useContext(TripContext);
}
