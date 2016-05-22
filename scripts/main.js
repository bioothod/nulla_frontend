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
        You are looking at translation creation site, please login or sign up.
      </div>
    );
  }
});


var MainCtl = React.createClass({
  getInitialState: function() {
    return {
      logged: false,
      mbox: {},
    };
  },

  onSuccess: function(data) {
    this.setState({logged: true, mbox: data});
    window.logged = true;
  },
  onError: function(data) {
    this.onLogout();
  },

  onLogout: function() {
    this.setState(this.getInitialState());
    window.logged = false;
  },

  render: function() {
    var tags = {};
    tags["tags"] = [];

    var component;
    if (this.state.logged) {
      component =
        <div>
          <HelloBox mbox={this.state.mbox} onLogout={this.onLogout} />
          <ListCtl list_url={this.props.list} tags={tags} />
          <UploadCtl upload_url={this.props.upload} get_url={this.props.get} index_url={this.props.index} />
        </div>
    } else {
      component =
        <div>
          <AuthBox user_login={this.props.user_login} user_signup={this.props.user_signup}
            onSuccess={this.onSuccess} onError={this.onError} />
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

var host = "http://odin.reverbrain.com:8080";
var user_login = host + "/user_login";
var user_signup = host + "/user_signup";
var user_update = host + "/user_update";
var upload = host + "/upload";
var get = host + "/get";
var index = host + "/index";
var list = host + "/list";

ReactDOM.render(
  <MainCtl
    user_login={user_login} user_signup={user_signup} user_update={user_update}
    index={index} list={list}
    upload={upload} get={get}
  />,
  document.getElementById('main')
);
