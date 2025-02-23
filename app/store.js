import { create } from 'zustand'

const useClubMeetingStore = create((set) => ({
    clubs: [],
    meeting: 0,
    queryData: {},
    agenda: {},
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
        clubs: state.clubs.length ? state.clubs.unshift(newclub) : [newclub],
        }))
    },
    setMeeting: (newmeeting) => {
      set((state) => ({
        meeting: newmeeting
      }))
    }
}))

export default useClubMeetingStore;