export const addStream = (item) => {
    console.log('ADDING STREAM: ' + item);
    return {
        type: 'ADD_STREAM',
        item
    }
}
export const removeStream = (item) => {
    console.log('REMOVING STREAM: ' + item);
    return {
        type: 'REMOVE_STREAM',
        item
    }
}
