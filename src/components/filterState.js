export default {
	namespaced: true,
	state: {
		currentRegion: null,
		currentTown: null,
	},
	actions: {},
	mutations: {
		/** 紀錄觀光景點過濾 */
		SET_CURRENT_FILTER: (state, { region, town }) => {
			state.currentRegion = region
			state.currentTown = town
		},
	},
	getters: {
		currentRegion: state => state.currentRegion,
		currentTown: state => state.currentTown,
	},
}
