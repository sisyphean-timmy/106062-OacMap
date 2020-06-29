export default {
    namespaced: true,
    state: {
        isoheStation: {
            data: null
        },
        yacht: {
            data: null
        }
    },
    actions: {},
    mutations: {
        SET_MARK_DATA: (state, { key, payload }) => {
            state[key].data = payload
        },
        CLEAR_MARK_DATA: (state, { key }) => {
            state[key].data = null
        }
    },
    getters: {
        state: state => k => state[k]
    }
}