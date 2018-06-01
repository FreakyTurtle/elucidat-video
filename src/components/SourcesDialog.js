import React from 'react';
import Dialog from 'material-ui/Dialog';
import SourcesPicker from './SourcesPicker';
import FlatButton from 'material-ui/FlatButton';



export default class SourcesDialog extends React.Component {
    constructor(props) {
      super(props);
      // this.handleShareToggle = this.handleShareToggle.bind(this);
      // this.handleClose = this.handleClose.bind(this);
      // this.handleSelection = this.handleSelection.bind(this);
      this.state = {
        open: false,
      };
    }

    render() {
      const actions = [
        <FlatButton
          label="Ok"
          primary={true}
          keyboardFocused={true}
          onClick={this.handleClose}
        />,
      ];
        return(
            <Dialog
              title="Select source to share"
              actions={actions}
              modal={false}
              open={this.props.open}
              onRequestClose={this.props.onRequestClose}
            >
              <SourcesPicker
                sources={this.props.sources}
                onSelection={(source) => this.props.onSelection(source)}
               />
            </Dialog>
        )
    }
}
