import {
  cyan500, cyan700,
  pinkA200,
  grey100, grey300, grey400, grey500,
  white, darkBlack, fullBlack,
} from 'material-ui/styles/colors';
// import {fade} from 'utils/colorManipulator';

/**
 *  Light Theme is the default theme used in material-ui. It is guaranteed to
 *  have all theme variables needed for every component. Variables not defined
 *  in a custom theme will default to these values.
 */
export default {
  fontFamily: 'Roboto, sans-serif',
  // borderRadius: 2,
  palette: {
    primary1Color: '#009BCC',
    primary2Color: '#ffa91a',
    primary3Color: grey400,
    accent1Color: pinkA200,
  //   accent2Color: grey100,
  //   accent3Color: grey500,
    textColor: '#009BCC',
  //   secondaryTextColor: fade(darkBlack, 0.54),
    alternateTextColor: white,
  //   canvasColor: white,
  //   borderColor: grey300,
  //   disabledColor: fade(darkBlack, 0.3),
  //   pickerHeaderColor: cyan500,
  //   clockCircleColor: fade(darkBlack, 0.07),
  //   shadowColor: fullBlack,
  },
};
