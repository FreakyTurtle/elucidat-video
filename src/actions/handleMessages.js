export const addMessage = (msg) => {
    console.log('ADDING MESSAGE: ' + msg);
    return {
        type: 'ADD_MESSAGE',
        msg
    }
}
