import React, { Component } from 'react';
import './App.css';
import Button from '@material-ui/core/Button';
import { Game } from './game';

class App extends Component {

    game;

    constructor() {
        super();
        this.state = { start:false, training:0, trainState:'Now, AI plays randomly to collect data.'};
    }

    startPIXI = () => {
        this.setState({start:true});
        this.game = new Game(500, 600);
        setInterval(() => {
            if (this.state.training !== this.game.tried || this.game.trainState !== this.state.trainState) {
                this.setState({training:this.game.tried, trainState: this.game.trainState});
            }
        },17);
    }

    stopGame = () => {
        this.game.suspend();
    }

    restart = () => {
        this.game.restartTraning();
    }

    render() {
        if (!this.state.start) {
            return (
                <div id='start' className="App">
                <Button variant="outlined" color='primary' onClick={this.startPIXI} >
                        Start AI traning
                </Button>
                </div>
            );
        } else {
            return (
                <div>
                    this is {this.state.training} time to train.<br/>
                    {this.state.trainState}
                    <Button style={{margin:'10px 10px 10px 10px'}} variant="outlined" color='secondary' onClick={this.restart} >
                            reStart traning
                    </Button>
                </div>
            );
        }
    }
}

export default App;