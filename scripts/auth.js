var AuthForm = React.createClass({
  getInitialState: function() {
    return {username: '', password: ''};
  },

  handleUsernameChange: function(e) {
    this.setState({username: e.target.value});
  },
  handlePasswordChange: function(e) {
    this.setState({password: e.target.value});
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var username = this.state.username.trim();
    var password = this.state.password.trim();
    if (!username || !password) {
      return;
    }

    this.props.onAuthSubmit({username: username, password: password});
    this.setState({username: '', password: ''});
  },
  render: function() {
    return (
      <form className="authForm" onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Your name" value={this.state.username} onChange={this.handleUsernameChange}/>
        <input type="password" placeholder="Your password..." value={this.state.password} onChange={this.handlePasswordChange}/>
        <input type="submit" value="Post" />
      </form>
    );
  }
});

var AuthUploadBox = React.createClass({
  handleAuthSubmit: function(auth) {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: auth,
      success: function(data) {
        this.props.onSuccess(data);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
        this.props.onError(status, err.toString());
      }.bind(this)
    });
  },

  render: function() {
    return (
      <AuthForm onAuthSubmit={this.handleAuthSubmit} onSuccess={this.props.onSuccess} onError={this.props.onError} />
    );
  }
});

var LoginBox = React.createClass({
  render: function() {
    return (
      <div className="loginBox">
        <h1>Login</h1>
        <AuthUploadBox url={this.props.url} onSuccess={this.props.onSuccess} onError={this.props.onError} />
      </div>
    );
  }
});

var SignupBox = React.createClass({
  render: function() {
    return (
      <div className="signupBox">
        <h1>Sign up</h1>
        <AuthUploadBox url={this.props.url} onSuccess={this.props.onSuccess} onError={this.props.onError} />
      </div>
    );
  }
});

var AuthBox = React.createClass({
  getInitialState: function() {
    return {
      loginSelected: false,
      start: true,
    };
  },

  loadLoginPage: function() {
    this.setState({loginSelected: true, start: false});
  },
  loadSignupPage: function() {
    this.setState({loginSelected: false, start: false});
  },

  render: function() {
    var component;
    if (this.state.start) {
      component = <div className="lsBox">
          <span><a href="#" onClick={this.loadLoginPage}>Login</a></span>
          <span><a href="#" onClick={this.loadSignupPage}>Signup</a></span>
        </div>
    } else {
      if (this.state.loginSelected) {
        component = <LoginBox url={this.props.login} onSuccess={this.props.onSuccess} onError={this.props.onError} />
      } else {
        component = <SignupBox url={this.props.signup} onSuccess={this.props.onSuccess} onError={this.props.onError} />
      }
    }

    return (
      <div className="authBox">
        {component}
      </div>
    );
  }
});

window.AuthBox = AuthBox;
