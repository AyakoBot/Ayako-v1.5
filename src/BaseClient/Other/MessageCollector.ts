import { EventEmitter } from 'events';
import Eris from 'eris';
import type * as Typings from '../../typings/CustomTypings';

const MessageCollectorDefaults: Typings.MessageCollectorOptions = {
  timeout: 1000,
  count: 10,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filter: (_msg: Eris.Message) => true,
};

class MessageCollector extends EventEmitter {
  channel: Eris.TextableChannel;
  timeout: number;
  count: number;
  filter: (msg: Eris.Message) => boolean;
  collected: Eris.Collection<Eris.Message>;
  running: boolean;
  // init: () => void;

  /**
   * @param {Eris.TextableChannel} channel Channel to collect messages in
   * @param {MessageCollectorOptions} [options] Options for the message collector
   */
  constructor(
    channel: Eris.TextableChannel,
    options: Typings.MessageCollectorOptions = MessageCollectorDefaults,
  ) {
    super();
    const opt = Object.assign(MessageCollectorDefaults, options);
    this.channel = channel;
    this.timeout = opt.timeout;
    this.count = opt.count;
    this.filter = opt.filter;
    this.collected = new Eris.Collection(Eris.Message);
    this.running = false;

    this._onMessageCreate = this._onMessageCreate.bind(this);
    this._onMessageDelete = this._onMessageDelete.bind(this);
    this._onMessageUpdate = this._onMessageUpdate.bind(this);

    this.onCollect = this.onCollect.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onUpdate = this.onUpdate.bind(this);

    /*
    this.init = () => {
      loadImport(MessageCollector);
      loadPrototype('TextChannel', (options = MessageCollectorDefaults) => {
        return new MessageCollector(channel, options).run();
      });
      loadPrototype('PrivateChannel', (options = MessageCollectorDefaults) => {
        return new MessageCollector(channel, options).run();
      });
      loadPrototype(
        'Client',
        (channel: Eris.TextableChannel, options = MessageCollectorDefaults) => {
          return new MessageCollector(channel, options).run();
        },
      );
    };
    */
  }

  /**
   * @param {Eris.Message} msg
   */
  _onMessageCreate(msg: Eris.Message) {
    if (!this.running) return;
    if (this.channel.id !== msg.channel.id) return;
    if (!this.filter(msg)) return;
    this.emit('collect', msg);
  }

  /**
   * @param {Eris.Message} msg
   * @param {Eris.OldMessage} oldMsg
   */
  _onMessageUpdate(msg: Eris.Message, oldMsg: Typings.OldMessage) {
    if (!this.running) return;
    if (this.channel.id !== msg.channel.id) return;
    if (!this.filter(msg)) {
      this.collected.remove(msg);
      return;
    }
    if (!this.collected.has(oldMsg.id)) {
      this.emit('collect', msg);
      return;
    }
    this.emit('update', msg);
  }

  _onMessageDelete(msg: Eris.Message) {
    if (!this.running) return;
    if (!this.collected.has(msg.id)) return;
    this.emit('delete', msg);
  }

  /**
   * @returns {Promise<MessageCollector>}
   */
  run(): Promise<MessageCollector> {
    this.running = true;
    return new Promise((res) => {
      this.channel.client.setMaxListeners(this.getMaxListeners() + 1);
      this.channel.client.on('messageCreate', this._onMessageCreate);
      this.channel.client.on('messageUpdate', this._onMessageUpdate);
      this.channel.client.on('messageDelete', this._onMessageDelete);

      this.setMaxListeners(this.getMaxListeners() + 1);
      this.on('collect', this.onCollect);
      this.on('update', this.onUpdate);
      this.on('delete', this.onDelete);

      if (this.timeout) setTimeout(() => this.stop(), this.timeout);
      this.once('stop', () => res(this));
    });
  }

  stop() {
    this.running = false;
    this.channel.client.setMaxListeners(this.getMaxListeners() - 1);
    this.channel.client.off('messageCreate', this._onMessageCreate);
    this.channel.client.off('messageUpdate', this._onMessageUpdate);
    this.channel.client.off('messageDelete', this._onMessageDelete);

    this.setMaxListeners(this.getMaxListeners() - 1);
    this.off('collect', this.onCollect);
    this.off('update', this.onUpdate);
    this.off('delete', this.onDelete);
    this.emit('stop');
    return this;
  }

  /**
   * @param {Eris.Message} msg
   */
  onCollect(msg: Eris.Message) {
    this.collected.add(msg);
    if (this.count && this.collected.size === this.count) this.stop();
  }

  /**
   * @param {Eris.Message} msg
   */
  onUpdate(msg: Eris.Message) {
    this.collected.update(msg);
  }

  /**
   * @param {Eris.Message} msg
   */
  onDelete(msg: Eris.Message) {
    this.collected.remove(msg);
  }
}

export default MessageCollector;
