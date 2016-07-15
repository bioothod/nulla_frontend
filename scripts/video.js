var Video = React.createClass({
  componentDidMount: function() {
    if (this.props.obj && this.props.obj.playlist && this.props.obj.ctype == "playlist/dash") {
      var tmp = document.getElementById('test_video');
      var player = dashjs.MediaPlayer().create();
      player.initialize(tmp, this.props.obj.playlist.playlist_url, true);
    }
  },

  componentDidUpdate: function(prevProps, prevState) {
    console.log("update: %o", this.props.obj);

    if (this.props.obj && this.props.obj.playlist && this.props.obj.ctype == "playlist/dash") {
      // only update content object if it differs, this allows to play video while changing list of files
      if (this.props.obj != prevProps.obj) {
        var tmp = document.getElementById('test_video');
        var player = dashjs.MediaPlayer().create();
        player.initialize(tmp, this.props.obj.playlist.playlist_url, true);
      }
    }
  },

  render: function() {
    return (
        <video id="test_video" autoplay="true" controls="true" src={this.props.obj.playlist.playlist_url} />
    );
  }
});

window.Video = Video;

var MainPlaylist = React.createClass({
  getInitialState: function() {
    return {
      playlist: {}
    }
  },

  split: function(tracks, total_duration, split_duration) {
    var idx = 0;
    var start = 0;
    var ret = [];
    while (total_duration > 0) {
      if (idx >= tracks.length) {
        idx = 0;
        start += split_duration;
      }

      var track = tracks[idx];
      var t = {};
      t.key = track.key;
      t.meta_key = track.meta_key;
      t.number = track.number;
      t.bucket = track.bucket;
      t.duration = split_duration*1000;
      t.start = start*1000;
      ret.push(t);

      total_duration -= split_duration;

      idx++;
    }

    return ret;
  },

  generatePlaylist: function(type) {
    var pl = {};
    pl.timeout_sec = 10000000;
    pl.chunk_duration_sec = 10;

    var a1 = {};
    a1.bucket = 'b1';
    a1.key = 'audio1.mp4';
    a1.meta_key = 'audio1.mp4.meta'
    a1.number = 1;
    var a2 = {};
    a2.bucket = 'b1';
    a2.key = 'audio2.mp4';
    a2.meta_key = 'audio2.mp4.meta'
    a2.number = 1;
    var audio_tracks = [a1, a2];


    var v1 = {};
    v1.bucket = 'b1';
    v1.key = 'video1.mp4';
    v1.meta_key = 'video1.mp4.meta'
    v1.number = 1;
    var v2 = {};
    v2.bucket = 'b1';
    v2.key = 'video2.mp4';
    v2.meta_key = 'video2.mp4.meta'
    v2.number = 1;
    var video_tracks = [v1, v2];

    var audio = {};
    audio.skip = false;
    audio.tracks = this.split(audio_tracks, 240, 30);


    var video = {};
    video.skip = false;
    video.tracks = this.split(video_tracks, 240, 5);

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
        this.setState({playlist: obj});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error("generatePlaylist: status: %d, error: %s, data: %s", status, err.toString(), xhr.responseText);
      }
    });
  },

  render: function() {
    if (!this.state.playlist.ctype) {
      this.generatePlaylist("dash");
      return null;
    }

    return (<Video obj={this.state.playlist} />);
  }
});

window.MainPlaylist = MainPlaylist;
