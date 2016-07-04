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
  render: function() {
    var tracks = this.props.obj.media.tracks.map(function(track) {
      var media = this.dump_audio_video(track);
      return (
        <div className="trackInfo" key={track.number}>
          <p>Track number: {track.number}</p>
          <p>Codec: {track.codec}</p>
          <p>Mime type: {track.mime_type}</p>
          <p>Media Duration: {track.media_duration / track.media_timescale} seconds</p>
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
  render: function() {
    if (!this.props.obj || !this.props.obj.name)
      return null;

    var obj = this.props.obj;

    if (startsWith(this.props.ctype, "image/")) {
      var url = this.props.get_url + "/" + obj.bucket + "/" + obj.name;
      return (
          <img src={url} />
      );
    } else if (startsWith(this.props.ctype, "audio/") || startsWith(this.props.ctype, "video/")) {
      return (
          <MediaInfo meta_json_url={this.props.meta_json_url} obj={this.props.obj} />
      );
    } else {
      return (
          <p>This is unknown object "{obj.name}" with content type "{this.props.ctype}"</p>
      );
    }
  }
});

var KeyInfo = React.createClass({
  onClick: function(event) {
    event.preventDefault();
    this.props.onClick(this.props.obj);
  },
  render: function() {
    var obj = this.props.obj;
    var d = new Date(obj.timestamp);

    return (
      <div className="keyInfo">
        <p>File: <a href="" onClick={this.onClick}>{obj.name}</a></p>
        <p>Bucket: {obj.bucket}</p>
        <p>Size: {obj.size}</p>
        <p>Created: {d.toISOString()}</p>
      </div>
    );
  }
});

window.ContentCtl = ContentCtl;
window.KeyInfo = KeyInfo;
