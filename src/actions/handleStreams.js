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
export const changeSelected= (item) => {
    console.log('CHANGE SELECTED STREAM: ' + item);
    return {
        type: 'CHANGE_SELECTED',
        item
    }
}
export const removeAllStreams = () => {
    console.log('REMOVING ALL STREAMS');
    return {
        type: 'REMOVE_ALL_STREAMS'
    }
}
export const unSelected= () => {
    console.log('UNSELECTED STREAM');
    return {
        type: 'CHANGE_SELECTED',
        item: ""
    }
}
export const changeActive= (item) => {
    console.log('CHANGE ACTIVE STREAM: ' + item);
    return {
        type: 'CHANGE_ACTIVE',
        item
    }
}
