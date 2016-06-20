var HelloBox = React.createClass({
  render: function() {
    return (
      <div className="usernameClass">
        Hello, {this.props.mbox.realname}. <span><a href="#" onClick={this.props.onLogout}>Logout</a></span>
      </div>
    );
  }
});

var Empty = React.createClass({
  render: function() {
    return (
      <div className="emptyClass">
        {this.props.message}
      </div>
    );
  }
});


var MainCtl = React.createClass({
  getInitialState: function() {
    return {
      logged: false,
      mbox: {},
      meta_tag: {
        bucket: '',
        key: 'tags',
      },
      auth_message: 'You are looking at translation creation site, please login or sign up.',
    };
  },

  onSuccess: function(data) {
    this.setState({
      logged: true,
      mbox: data.mailbox,
      meta_tag: {
        bucket: data.meta_bucket,
        key: data.meta_index,
      }
    });
  },
  onError: function(data) {
    console.log('auth error: %o', data);
    this.onLogout();

    var message = 'Auth error, status: ' + data.status;
    if (data.data) {
      var reply = JSON.parse(data.data);

      if (reply.error) {
        message += ", error: " + reply.error;
      }
    }

    this.setState({auth_message: message});
  },

  onLogout: function() {
    this.setState(this.getInitialState());
  },

  render: function() {
    var component;
    if (this.state.logged) {
      component =
        <div>
          <HelloBox mbox={this.state.mbox} onLogout={this.onLogout} />
          <ListCtl list_url={this.props.list} get_url={this.props.get} meta_tag={this.state.meta_tag} upload_url={this.props.upload} index_url={this.props.index}/>
        </div>
    } else {
      component =
        <div>
          <AuthBox user_login={this.props.user_login} user_signup={this.props.user_signup}
            onSuccess={this.onSuccess} onError={this.onError} />
          <Empty message={this.state.auth_message} />
        </div>
    }

    return (
      <nav>
        {component}
      </nav>
    );
  }
});

var auth_host = "http://odin.reverbrain.com:8080"
var user_login = auth_host + "/login";
var user_signup = auth_host + "/signup";
var user_update = auth_host + "/update";

var host = "http://odin.reverbrain.com:8080";
var upload = host + "/upload";
var get = host + "/get";

var index_host = "http://odin.reverbrain.com:8080"
var index = index_host + "/index";
var list = index_host + "/list";

ReactDOM.render(
  <MainCtl
    user_login={user_login} user_signup={user_signup} user_update={user_update}
    index={index} list={list}
    upload={upload} get={get}
  />,
  document.getElementById('main')
);
