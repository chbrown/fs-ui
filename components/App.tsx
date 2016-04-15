import * as React from 'react';
import {Link} from 'react-router';

class App extends React.Component<{}, {}> {
  render() {
    const {children} = this.props;
    return (
      <div>
        <nav>
          <Link activeClassName="active" to={`compare`}>Compare</Link>
          <Link activeClassName="active" to={`rename`}>Rename</Link>
          <Link activeClassName="active" to={`deduplicate`}>Deduplicate</Link>
        </nav>
        <div className="content">{children}</div>
      </div>
    );
  }
}
export default App;
