var HelloBox = React.createClass({
  render: function() {
    return (
      <div className="usernameClass">
        Hello, {this.props.username}. <span><a href="#" onClick={this.props.onLogout}>Logout</a></span>
      </div>
    );
  }
});

var Empty = React.createClass({
  render: function() {
    return (
      <div className="emptyClass">
        You are looking at translation creation site, please login or sign up.
      </div>
    );
  }
});


var MainCtl = React.createClass({
  getInitialState: function() {
    return {
      logged: false,
      username: '',
    };
  },

  onSuccess: function(data) {
    this.setState({logged: true, username: data.username});
    window.logged = true;
  },
  onError: function(data) {
    this.onLogout();
  },

  onLogout: function() {
    this.setState({logged: false, username: ''});
    window.logged = false;
  },

  render: function() {
    var component;
    if (this.state.logged) {
      component =
        <div>
          <HelloBox username={this.state.username} onLogout={this.onLogout} />
          <UploadCtl upload_url={this.props.upload} get_url={this.props.get} />
        </div>
    } else {
      component =
        <div>
          <AuthBox login={this.props.login} signup={this.props.signup} onSuccess={this.onSuccess} onError={this.onError} />
          <Empty />
        </div>
    }

    return (
      <nav>
        {component}
      </nav>
    );
  }
});

ReactDOM.render(
  <MainCtl
    login="http://odin.reverbrain.com:8080/login" signup="http://odin.reverbrain.com:8080/signup"
    upload="http://odin.reverbrain.com:8080/upload/" get="http://odin.reverbrain.com:8080/get/"
  />,
  document.getElementById('main')
);
