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
      meta_tag: 'tags',
      auth_message: '',
    };
  },

  onSuccess: function(data) {
    this.setState({
      logged: true,
      mbox: data.mailbox,
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
          <ListCtl meta_tag={this.state.meta_tag}
            list_url={this.props.list} list_meta_url={this.props.list_meta}
            index_url={this.props.index}
            upload_url={this.props.upload}
            get_url={this.props.get} get_key_url={this.props.get_key} meta_json_url={this.props.get_meta_json}
            manifest_url={this.props.manifest_url}
          />
        </div>
    } else {
      component =
        <div className="welcome">
          <AuthBox
            user_login={this.props.user_login}
            user_signup={this.props.user_signup}
            onSuccess={this.onSuccess}
            onError={this.onError}
          />

          <div className="welcome_content">
            <p>You are looking at proof-of-concept service which allows to generate adaptive MPEG-DASH/HLS stream by muxing multiple streams in realtime without content reencoding.</p>
            <p>Example below (MPEG-DASH is supported in Chrome and recent IE and Firefox) plays 5-seconds video chunks from 2 video tracks and 30-seconds audio chunks from 2 audio files.</p>
            <p>This service allows to generate such playlists in realtime without content reencoding.</p>
            <p>If you are interested, please login or sign up.</p>
          </div>
          <Empty message={this.state.auth_message} />
          <MainPlaylist manifest_url={this.props.manifest_url} />
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
var get_key = host + "/get_key";
var meta_json = host + "/meta_json";
var get = host + "/get";

var index_host = "http://odin.reverbrain.com:8080"
var index = index_host + "/index";
var list = index_host + "/list";
var list_meta = index_host + "/list_meta";

var manifest_url = "http://odin.reverbrain.com:8080/manifest";

ReactDOM.render(
  <MainCtl
    user_login={user_login} user_signup={user_signup} user_update={user_update}
    index={index} list={list} list_meta={list_meta}
    upload={upload} get={get} get_key={get_key} get_meta_json={meta_json}
    manifest_url={manifest_url}
  />,
  document.getElementById('main')
);
