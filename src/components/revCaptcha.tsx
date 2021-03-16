import * as React from "react";
import { hot } from "react-hot-loader";
import Rodal from 'rodal';
import "./../assets/scss/revCaptcha.scss";
import 'rodal/lib/rodal.css';
import Confetti from 'react-confetti'

const logo = require("./../assets/img/logo.png");
const checkmark = require("./../assets/img/green-check.png");
const NUM_EQUATIONS = 1;
const TIMER_SECONDS = 10;
const defaultState = {
  loading: false,
  modalOpen: false,
  secondsLeft: TIMER_SECONDS,
  equations: [],
  solutionsFormData: {},
  confetti: false,
}

class RevCaptcha extends React.Component<Record<string, unknown>, any> {
  private timer;

  constructor(props: never) {
    super(props);

    this.state = {...defaultState};

    this.handleSolutionChange = this.handleSolutionChange.bind(this);
    this.validateSolutions = this.validateSolutions.bind(this);
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.onTimerTick = this.onTimerTick.bind(this);

    this.timer = setInterval(() => {
      this.onTimerTick();
    }, 1000);
  }

  componentDidMount() {
    this.setState({
      equations: this.generateEquations(NUM_EQUATIONS),
    });
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }
  
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }
  
  updateWindowDimensions() {
    this.setState({ clientWidth: window.innerWidth, clientHeight: window.innerHeight });
  }

  public render() {
    const { loading, modalOpen, secondsLeft, equations, confetti, clientHeight, clientWidth } = this.state;

    return (<>
      {confetti && <Confetti
        width={clientWidth}
        height={clientHeight}
      />}
      <Rodal
        visible={modalOpen}
        showCloseButton={false}
        onClose={this.hide.bind(this)}
        height={600}
        className="n"
      >
        <div>
          <div className="revCaptchaModalHeader">
            <h3>Verify you're a robot</h3>
            <h4>Solve all {NUM_EQUATIONS} math problems in under {secondsLeft} second{secondsLeft === 1 ? '' : 's'} to prove you're a robot.</h4>
          </div>
          <div className="revCaptchaEquationsContainer" style={{height: '460px', width: '380px', overflowY: 'scroll'}}>
            <form onSubmit={this.validateSolutions}>
              {equations.map((equation) => {
                return <div key={`equation-${equation.id}-container`}>
                  <label>
                    {equation.a} {equation.operand} {equation.b}
                    <input
                      type="text"
                      className="revCaptchaSolutionInput"
                      name={`solution-${equation.id}`}
                      key={`equation-${equation.id}-solution`}
                      value={this.state?.solutionsFormData?.[`solution-${equation.id}`] ?? ''}
                      onChange={this.handleSolutionChange}
                    />
                  </label>
                </div>
              })}
              <input type="submit" value="Submit" className="revCaptchaSubmitButton" />
            </form>
          </div>
        </div>
      </Rodal>
      <div className="revCaptchaContainer">
        {confetti ? <img className="revCaptchaCheckmark" src={checkmark.default} /> : loading ? <div className="spinning-loader"></div> : <>
          <div
            className="revCaptchaCheckbox"
            onClick={() => {
              this.setState({
                loading: true,
              });
              setTimeout(() => {
                this.resetTimer();
                this.setState({
                  modalOpen: true,
                });
              }, 1000 * Math.random());
            }}
          ></div>
        </>}
        <h2 className="revCaptchaText">I&apos;m a robot</h2>
        <img className="revCaptchaLogo" src={logo.default} />
      </div>
    </>);
  }

  resetTimer() {
    this.setState({
      secondsLeft: TIMER_SECONDS,
    });
  }

  hide() {
    this.setState({
      ...defaultState,
      equations: this.generateEquations(NUM_EQUATIONS),
      modalOpen: false,
    });
  }

  handleSolutionChange(e) {
    this.setState({
      solutionsFormData: {
        [e.target.name]: e.target.value,
      },
    })
  }

  validateSolutions(e) {
    const { equations, solutionsFormData } = this.state;

    e.preventDefault();

    let success = true;
    equations.forEach((equation, index) => {
      const submittedSolution = solutionsFormData?.[`solution-${index}`]?.trim();
      if (typeof submittedSolution === 'undefined') {
        success = false;
      }

      const solution = this.getSolution(equation.a, equation.b, equation.operand);
      const parsedSubmission = parseInt(submittedSolution);

      if (isNaN(parsedSubmission) || solution !== parsedSubmission) {
        success = false;
      }
    });
    this.setState({
      ...defaultState,
      equations: this.generateEquations(NUM_EQUATIONS),
      confetti: success,
      solutionsFormData: {},
    });
  }

  generateEquations(count: number) {
    if (isNaN(count) || count < 0) throw new Error("Invalid count");

    const operands = ['+', '-', '*'];
    const MIN_INT = 1;
    const MAX_INT = 99999;

    const equations = [];

    for (let i: number = 0; i < count; i++ ) {
      const operand = operands[Math.floor(Math.random() * operands.length)];
      const a = this.getRandomIntegerInRange(MIN_INT, MAX_INT);
      const b = this.getRandomIntegerInRange(MIN_INT, MAX_INT);

      equations.push({
        id: i,
        a,
        b,
        operand,
      });
    }

    return equations;
  }

  getSolution(a: number, b: number, operand: string) {
    switch (operand) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '*':
        return a * b;
      // not supported due to floating point complications
      case '/': 
        return a / b;
    }
  }

  getRandomIntegerInRange(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) ) + min;
  }

  onTimerTick() {
    const { secondsLeft } = this.state;
    const newSeconds = secondsLeft - 1;
    if (newSeconds >= 0) {
      this.setState({
        secondsLeft: newSeconds,
      })
    } else {
      this.setState({
        ...defaultState,
        equations: this.generateEquations(NUM_EQUATIONS),
        solutionsFormData: {},
      });
    }
  }
}

declare let module: Record<string, unknown>;
export default hot(module)(RevCaptcha);
