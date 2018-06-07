const default_streams = new Array(12).fill("");
// @TODO replace this number with a configurable variable in case people want to make bigger rooms


export default (state = default_streams, payload) => {
    let new_state = [...state];
  switch (payload.type) {
    case 'ADD_STREAM':
        for (var i = 0; i < new_state.length; i++) {
            if(new_state[i] === ""){
                new_state[i] = payload.item;
                break;
            }
        }
      return [...new_state];
    case 'REMOVE_STREAM':
        for (var i = 0; i < new_state.length; i++) {
            if(new_state[i] === payload.item){
                new_state[i] = "";
                break;
            }
        }
      return [...new_state];
    default:
      return state;
  }
}
