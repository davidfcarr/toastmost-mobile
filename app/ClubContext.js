import React, { createContext, useState } from 'react';

const ClubContext = createContext();

const ClubProvider = ({ children }) => {
  const [club, setClub] = useState({'domain':'','code':'','url':''});
  const [meeting, setMeeting] = useState(0);
  const [agenda, setAgenda] = useState({});
  const [members, setMembers] = useState([]);
  const [user_id, setUserId] = useState(0);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [lastSnoozed, setLastSnoozed] = useState(null);

  return (
    <ClubContext.Provider value={{ club, setClub, meeting, setMeeting, agenda, setAgenda, members, setMembers, user_id, setUserId, pollingInterval, setPollingInterval, lastSnoozed, setLastSnoozed }}>
      {children}
    </ClubContext.Provider>
  );
};

export { ClubProvider, ClubContext };