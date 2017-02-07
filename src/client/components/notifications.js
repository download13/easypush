const {h, Component} = require('preact');
const {
  createChannel,
  getChannels,
  setChannelLabel,
  destroyChannel,
  enableNotifications,
  disableNotifications
} = require('../api');


class Notification extends Component {
  constructor(props) {
    super(props);

    this.state = {
      notificationsEnabled: localStorage.getItem('notificationsEnabled') === '1',
      channels: []
    };

    this.createChannel = this.createChannel.bind(this);
    this.refreshChannels = this.refreshChannels.bind(this);
    this.enableNotifications = this.enableNotifications.bind(this);
    this.disableNotifications = this.disableNotifications.bind(this);
  }

  componentWillMount() {
    this.refreshChannels();
  }

  render(props, {notificationsEnabled, channels}) {
    let subscribeText, subscribeAction, createButton, enableMessage;
    if(notificationsEnabled) {
      subscribeText = 'Disable Notifications';
      subscribeAction = this.disableNotifications;

      createButton = <button class="create-channel" onClick={this.createChannel} title="Create Channel">+</button>

      if(channels.length === 0) {
        enableMessage = <div class="enable-message">Create a channel to get started</div>
      }
    } else {
      subscribeText = 'Enable Notifications';
      subscribeAction = this.enableNotifications;

      enableMessage = <div class="enable-message">Enable notifications to create channels</div>
    }

    return <div class="notifications">
      <header>
        <h1>EasyPush</h1>
        <a class="docs" href="/">Docs</a>
        <button class="toggle-notifications" onClick={subscribeAction}>{subscribeText}</button>
      </header>
      <div>
        {enableMessage}
        {channels.map(channel => <Channel key={channel.id} onChanged={this.refreshChannels} {...channel}/>)}
      </div>
      {createButton}
    </div>;
  }

  async enableNotifications() {
    await enableNotifications();
    this.setState({
      notificationsEnabled: localStorage.getItem('notificationsEnabled') === '1'
    });
  }

  async disableNotifications() {
    await disableNotifications();
    this.setState({
      notificationsEnabled: localStorage.getItem('notificationsEnabled') === '1'
    });
  }

  async refreshChannels() {
    const channels = await getChannels();
    this.setState({channels});
  }

  async createChannel() {
    const label = prompt('Label this channel?');
    if(label !== null) {
      await createChannel(label);
      await this.refreshChannels();
    }
  }
}


class Channel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      label: props.label
    };

    this.saveLabel = this.saveLabel.bind(this);
    this.destroyChannel = this.destroyChannel.bind(this);
    this.labelKeyHandler = this.labelKeyHandler.bind(this);
  }

  componentWillReceiveProps(props) {
    if(props.label !== this.props.label) {
      this.setState({label: props.label});
    }
  }

  render({id, label}, state) {
    let saveBtn;
    if(label !== state.label) {
      saveBtn = <button class="save-btn" onClick={this.saveLabel}>Save</button>
    }

    return <div class="channel">
      <div class="left-group">
        <span class="id">{id}</span>
        <input
          class="label"
          placeholder="Label"
          onInput={e => this.setState({label: e.target.value})}
          onKeyUp={this.labelKeyHandler}
          value={state.label}
        />
      </div>
      <div class="right-group">
        {saveBtn}
        <button class="del-btn" onClick={this.destroyChannel}>Delete</button>
      </div>
    </div>
  }

  async saveLabel() {
    const {id, onChanged} = this.props;
    const {label} = this.state;

    await setChannelLabel(id, label);
    if(onChanged) onChanged();
  }

  async destroyChannel() {
    const {id, onChanged} = this.props;

    if(confirm('Are you sure you want to delete this channel?')) {
      await destroyChannel(id);
      if(onChanged) onChanged();
    }
  }

  labelKeyHandler(e) {
    if(e.key === 'Enter' && this.props.label !== this.state.label) {
      this.saveLabel();
    }
  }
}


module.exports = Notification;
