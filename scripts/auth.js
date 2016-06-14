var SignupForm = React.createClass({
  getInitialState: function() {
    return {
      username: '',
      password: '',
      realname: '',
      email: '',
    };
  },

  handleUsernameChange: function(e) {
    this.setState({username: e.target.value});
  },
  handlePasswordChange: function(e) {
    this.setState({password: e.target.value});
  },
  handleRealnameChange: function(e) {
    this.setState({realname: e.target.value});
  },
  handleEmailChange: function(e) {
    this.setState({email: e.target.value});
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var username = this.state.username.trim();
    var password = this.state.password.trim();
    var realname = this.state.realname.trim();
    var email = this.state.email.trim();
    if (!username || !password) {
      return;
    }

    this.props.onAuthSubmit({
      username: username,
      password: password,
      realname: realname,
      email: email,
    });
    this.setState(this.getInitialState());
  },
  render: function() {
    return (
      <form className="authForm" onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Your name" value={this.state.username} onChange={this.handleUsernameChange}/><br/>
        <input type="password" placeholder="Your password..." value={this.state.password} onChange={this.handlePasswordChange}/><br/>
        <input type="text" placeholder="Your real name" value={this.state.realname} onChange={this.handleRealnameChange}/><br/>
        <input type="text" placeholder="Your email" value={this.state.email} onChange={this.handleEmailChange}/><br/>
        <input type="submit" value="Post" />
      </form>
    );
  }
});

var LoginForm = React.createClass({
  getInitialState: function() {
    return {
      username: '',
      password: '',
    };
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

    this.props.onAuthSubmit({
      username: username,
      password: password,
    });
    this.setState(this.getInitialState());
  },
  render: function() {
    return (
      <form className="authForm" onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Your name" value={this.state.username} onChange={this.handleUsernameChange} /><br/>
        <input type="password" placeholder="Your password..." value={this.state.password} onChange={this.handlePasswordChange} /><br/>
        <input type="submit" value="Post" />
      </form>
    );
  }
});

var LoginBox = React.createClass({
  render: function() {
    return (
      <div className="loginBox">
        <h1>Login</h1>
        <LoginForm url={this.props.url} onAuthSubmit={this.props.onAuthSubmit} />
      </div>
    );
  }
});

var SignupBox = React.createClass({
  render: function() {
    return (
      <div className="signupBox">
        <h1>Sign up</h1>
        <SignupForm url={this.props.url} onAuthSubmit={this.props.onAuthSubmit} />
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

  handleAuthSubmit: function(auth) {
    var url = this.props.user_signup;
    if (this.state.loginSelected)
      url = this.props.user_login;

    $.ajax({
      url: url,
      dataType: 'json',
      type: 'POST',
      data: auth,
      success: function(data) {
        this.props.onSuccess(data);
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState(this.getInitialState());
        console.log("jquery error: xhr: %o", xhr);
        var status = xhr.status;
        if (xhr.status === 0) {
          status = -22;
        }
        this.props.onError({status: status, error: err.toString(), data: xhr.responseText});
      }.bind(this)
    });
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
        component = <LoginBox url={this.props.user_login} onAuthSubmit={this.handleAuthSubmit} />
      } else {
        component = <SignupBox url={this.props.user_signup} onAuthSubmit={this.handleAuthSubmit} />
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
