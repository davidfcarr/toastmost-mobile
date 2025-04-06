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
    agendaPollingInterval: null,
    missedTranslation: [],
    progress: '',
    setProgress: (l) => {
      set((state) => ({
        progress: l
      }))
    },
    setMissedTranslation: (i) => {
      set((state) => ({
        missedTranslation: (i !== null) ? [...state.missedTranslation, i] : []
      }))
    },
    setAgendaPollingInterval: (i) => {
      set((state) => ({
        agendaPollingInterval: i
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