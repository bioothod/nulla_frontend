var PlaylistElement = React.createClass({
  render: function() {
    var obj = this.props.obj;

    return (
      <div className="playlistElement">
        <span onClick={this.props.onRemove}>{obj.name + "#" + obj.track.number}</span>
      </div>
    );
  },
});

var PlaylistCtl = React.createClass({
  getInitialState: function() {
    return {
      audio: {
        tracks: [],
        duration_sec: 0,
      },
      video: {
        tracks: [],
        duration_sec: 0,
      },
    };
  },

  onDrop: function(event) {
    event.preventDefault();

    var obj = window.DraggedObject;
    if (!obj)
      return;

    window.DraggedObject = null;

    if (obj.track.audio.sample_rate !== 0) {
      var tracks = this.state.audio.tracks;
      var ntracks = tracks.concat([obj]);
      var duration_sec = Math.round(this.state.audio.duration_sec + obj.duration_sec);
      this.setState({audio: {tracks: ntracks, duration_sec: duration_sec}});
    } else if (obj.track.video.width !== 0) {
      var tracks = this.state.video.tracks;
      var ntracks = tracks.concat([obj]);
      var duration_sec = Math.round(this.state.video.duration_sec + obj.duration_sec);
      this.setState({video: {tracks: ntracks, duration_sec: duration_sec}});
    }
  },

  onDragOver: function(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  },

  onRemove: function(obj) {
    var remove_duration = 0;

    var filter_function = function(o, i, arr) {
      if (obj.key != o.key)
        return true;
      if (obj.bucket != o.bucket)
        return true;
      if (obj.track.number != o.track.number)
        return true;

      if (remove_duration != 0)
        return true;

      remove_duration = obj.duration_sec;
      return false;
    };

    if (obj.track.audio.sample_rate !== 0) {
      var ntracks = this.state.audio.tracks.filter(filter_function);
      var d = Math.round(this.state.audio.duration_sec - remove_duration);
      if (ntracks.length === 0) {
        d = 0;
      }
      this.setState({audio: {tracks: ntracks, duration_sec: d}});
    } else {
      var ntracks = this.state.video.tracks.filter(filter_function);
      var d = Math.round(this.state.video.duration_sec - remove_duration);
      if (ntracks.length === 0) {
        d = 0;
      }
      this.setState({video: {tracks: ntracks, duration_sec: d}});
    }
  },

  generatePlaylist: function(type) {
    var pl = {};
    pl.timeout_sec = 10000000;
    pl.chunk_duration_sec = 10;

    var map_function = function(track) {
      var ret = {};
      ret.bucket = track.bucket;
      ret.key = track.key;
      ret.meta_key = track.meta_key;
      ret.number = track.track.number;
      return ret;
    };

    var audio = {};
    audio.skip = false;
    audio.tracks = this.state.audio.tracks.map(map_function);

    var video = {};
    video.skip = false;
    video.tracks = this.state.video.tracks.map(map_function);

    pl.audio = audio;
    pl.video = video;
    pl.type = type;

    var url = this.props.manifest_url;
    $.ajax({
      url: url,
      method: "POST",
      data: JSON.stringify(pl),
      cache: false,
      dataType: 'json',
      success: function(reply) {
        var obj = {};
        obj.ctype = "playlist/" + pl.type;
        obj.playlist = reply;
        this.props.onPlay(obj);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error("generatePlaylist: status: %d, error: %s, data: %s", status, err.toString(), xhr.responseText);
      }
    });
  },

  render: function() {
    var map_function = function(obj) {
      // there might be multiple elements with the same key
      var tmp_key = obj.name + "." + obj.track.number + "." + Math.random();
      return(
        <PlaylistElement obj={obj} key={tmp_key} onRemove={this.onRemove.bind(this, obj)} />
      );
    }.bind(this);

    var audio_tracks = this.state.audio.tracks.map(map_function);
    var video_tracks = this.state.video.tracks.map(map_function);

    return(
      <div className="playlistCtl" onDrop={this.onDrop} onDragOver={this.onDragOver}>
        <p>Drag and drop tracks from content column (click on audio/video files) here to create playlist</p>
        <p><a href="#" onClick={this.generatePlaylist.bind(this, "dash")}>DASH playlist</a></p>
        <div className="playlistCtlMedia">
          <p>Audio duration: {this.state.audio.duration_sec}</p>
          {audio_tracks}
        </div>
        <div className="playlistCtlMedia">
          <p>Video duration: {this.state.video.duration_sec}</p>
          {video_tracks}
        </div>
      </div>
    );
  },
});

window.PlaylistCtl = PlaylistCtl;
