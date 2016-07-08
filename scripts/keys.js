function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
function startsWith(str, prefix) {
    return str.indexOf(prefix, 0) === 0;
}

var MediaInfo = React.createClass({
  dump_audio_video: function(media) {
    if (media.video.width !== 0) {
      return (
        <div className="trackInfoVideo">
          <p>Video:</p>
          <p>Dimensions: {media.video.width}x{media.video.height}</p>
        </div>
      );
    }
    if (media.audio.sample_rate !== 0) {
      return (
        <div className="trackInfoAudio">
          <p>Audio:</p>
          <p>Sample rate: {media.audio.sample_rate}</p>
          <p>Number of channels: {media.audio.channels}</p>
          <p>Bits per sample: {media.audio.bits_per_sample}</p>
        </div>
      );
    }

    return null;
  },
  onDragStart: function(track, event) {
    event.dataTransfer.setData('text/plain', 'unused');

    var obj = {}
    obj.name = this.props.obj.name;
    obj.bucket = this.props.obj.bucket;
    obj.key = this.props.obj.key;
    obj.meta_key = this.props.obj.meta_key;
    obj.track = track;
    obj.duration_sec = track.media_duration / track.media_timescale;

    window.DraggedObject = obj;
  },
  render: function() {
    var tracks = this.props.obj.media.tracks.map(function(track) {
      if (track.audio.sample_rate === 0 && track.video.width === 0)
        return null;

      var media = this.dump_audio_video(track);
      return (
        <div className="trackInfo" draggable="true" key={track.number} onDragStart={this.onDragStart.bind(this, track)}>
          <p>Track number: {track.number}</p>
          <p>Codec: {track.codec}</p>
          <p>Mime type: {track.mime_type}</p>
          <p>Duration: {Math.round(track.media_duration / track.media_timescale)} seconds</p>
          <p>Bandwidth: {track.bandwidth} bytes/sec</p>
          {media}
        </div>
      );
    }, this);

    return (
      <div className="mediaInfo">
        {tracks}
      </div>
    );
  }
});

var ContentCtl = React.createClass({
  componentDidUpdate: function(prevProps, prevState) {
    if (this.props.obj && this.props.obj.playlist) {
      // only update content object if it differs, this allows to play video while changing list of files
      if (this.props.obj != prevProps.obj) {
        var tmp = document.getElementById('test_video');
        var player = dashjs.MediaPlayer().create();
        console.log("Resetting player, test_video: %o", tmp);
        player.initialize(tmp, this.props.obj.playlist.playlist_url, true);
      }
    }
  },

  render: function() {
    var obj = this.props.obj;

    if (!obj.ctype)
      return null;

    if (startsWith(obj.ctype, "image/")) {
      var url = this.props.get_url + "/" + obj.bucket + "/" + obj.name;
      return (
          <img src={url} />
      );
    } else if (startsWith(obj.ctype, "audio/") || startsWith(obj.ctype, "video/")) {
      return (
          <MediaInfo meta_json_url={this.props.meta_json_url} obj={this.props.obj} />
      );
    } else if (startsWith(obj.ctype, "playlist/")) {
      return (
        <video id="test_video" controls="true" />
      );
    } else if (obj.name && obj.bucket) {
      var url = this.props.get_url + "/" + obj.bucket + "/" + obj.name;
      return (
        <div>
          <p>This is unknown object "{obj.name}" with content type "{obj.ctype}"</p>
          <p>You can download it over this <a href={url} target="_blank">link</a>.</p>
        </div>
      );
    } else {
      return null;
    }
  }
});

// there is no way to transfer objects via dataTransfer.setData(), only strings are allowed
// but this will require additional json pack/unpack, so this global is a workaround
window.DraggedObject = null;

var KeyInfo = React.createClass({
  onClick: function(event) {
    event.preventDefault();
    this.props.onClick(this.props.obj);
  },
  render: function() {
    var obj = this.props.obj;
    var d = new Date(obj.timestamp);

    var url = this.props.get_url + "/" + obj.bucket + "/" + obj.name;
    return (
      <div className="keyInfo">
        <p>File: <a href={url} onClick={this.onClick}>{obj.name}</a></p>
        <p>Bucket: {obj.bucket}</p>
        <p>Size: {obj.size}</p>
        <p>Created: {d.toISOString()}</p>
      </div>
    );
  }
});

window.ContentCtl = ContentCtl;
window.KeyInfo = KeyInfo;
