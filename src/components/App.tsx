import * as React from "react";
import { hot } from "react-hot-loader";

import "./../assets/scss/App.scss";
import RevCaptcha from "./revCaptcha";

class App extends React.Component<Record<string, unknown>, undefined> {
  public render() {
    return (
      <div className="app">
        <RevCaptcha />
      </div>
    );
  }
}

declare let module: Record<string, unknown>;

export default hot(module)(App);
