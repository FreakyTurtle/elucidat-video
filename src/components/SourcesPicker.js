import React from 'react';
import {GridList, GridTile} from 'material-ui/GridList';

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    width: 500,
    height: 450,
    overflowY: 'auto'
  },
};

export default class SourcesPicker extends React.Component {
    constructor(props) {
      super(props);
      this.handleClick = this.handleClick.bind(this)
    }
    handleClick = (source) => {
      this.props.onSelection(source)
    }

    render() {
        return(
            <div style={styles.root}>
              <GridList
                cellHeight={180}
                style={styles.gridList}
              >
                {this.props.sources.map((source) => (
                  <GridTile
                    key={source.id}
                    title={source.name}
                    onClick={() => this.handleClick(source)}
                  >
                    <img alt={source.name} src={source.thumbnail.toDataURL()} />
                  </GridTile>
                ))}
              </GridList>
            </div>
        )
    }
}
