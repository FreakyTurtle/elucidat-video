export default (state = [], payload) => {
    let new_state = [...state];
    switch (payload.type) {
        case 'ADD_MESSAGE':
            new_state.unshift(payload.msg);
            return [...new_state];
        default:
            return state;
    }
}
