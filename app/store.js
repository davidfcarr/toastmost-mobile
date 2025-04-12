import { create } from 'zustand'

function combineClubs(newclub, clubs) {
  clubs.unshift(newclub);
  return clubs;
}

const useClubMeetingStore = create((set) => ({
    clubs: [],
    meeting: 0,
    queryData: {},
    agenda: {},
    message: '',
    language: '',
    nextUpdate: 0,
    logMissedTranslation: false,
    progress: '',
    newsite: '',
    setNewsite: (l) => {
      set((state) => ({
        progress: l
      }))
    },
    setProgress: (l) => {
      set((state) => ({
        progress: l
      }))
    },
    setLogMissedTranslation: (i) => {
      set((state) => ({
        logMissedTranslation: i
      }))
    },
    setNextUpdate: (i) => {
      set((state) => ({
        nextUpdate: i
      }))
    },
    setLanguage: (l) => {
      set((state) => ({
        language: l
      }))
    },
    setClubs: (newclubs) => {
      set((state) => ({
        clubs: newclubs
      }))
    },
    setQueryData: (newq) => {
        set((state) => ({
          queryData: newq
        }))
    },
    setAgenda: (newagenda) => {
        set((state) => ({
          agenda: newagenda
        }))
    },
    addClub: (newclub) => {
        set((state) => ({
        clubs: state.clubs.length ? combineClubs(newclub,state.clubs) : [newclub],
        }))
    },
    setMeeting: (newmeeting) => {
      set((state) => ({
        meeting: newmeeting
      }))
    },
    setMessage: (msg) => {
      set((state) => ({
        message: msg
      }))
    },
}))

export default useClubMeetingStore;