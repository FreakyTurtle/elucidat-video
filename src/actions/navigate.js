// export const exampleAction = (item) => {
//   console.log(item);
//   return {
//     type: 'add',
//     item
//   }
// }
export const gotoRoom = (item) => {
  console.log('NAVIGATING TO ROOM: ' + item);
  return {
    type: 'IN_ROOM',
    item
  }
}
export const gotoWelcome = () => {
  console.log('NAVIGATING TO WELCOME')
  return {
    type: 'WELCOME'
  }
}
