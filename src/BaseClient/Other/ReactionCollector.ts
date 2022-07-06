import { EventEmitter } from 'events';
import type Eris from 'eris';
import client from '../ErisClient';

class MessageCollector extends EventEmitter {
  ended: boolean;
  time: number;
  recieved: number;
  message: Eris.Message;

  constructor(message: Eris.Message, time?: number) {
    super();
    this.time = time || 60000;
    this.ended = false;
    this.recieved = 0;
    this.message = message;

    this.handleReaction = this.handleReaction.bind(this);
    this.handleMessageDeletion = this.handleMessageDeletion.bind(this);
    this.handleChannelDeletion = this.handleChannelDeletion.bind(this);
    this.handleThreadDeletion = this.handleThreadDeletion.bind(this);
    this.handleGuildDeletion = this.handleGuildDeletion.bind(this);

    setTimeout(() => this.stop('time'), this.time);

    client.incrementMaxListeners();
    client.on('messageReactionAdd', this.handleReaction);
    client.on('messageDelete', this.handleMessageDeletion);
    client.on('channelDelete', this.handleChannelDeletion);
    client.on('threadDelete', this.handleThreadDeletion);
    client.on('guildDelete', this.handleGuildDeletion);

    this.once('end', () => {
      client.removeListener('messageReactionAdd', this.handleReaction);
      client.removeListener('messageDelete', this.handleMessageDeletion);
      client.removeListener('channelDelete', this.handleChannelDeletion);
      client.removeListener('threadDelete', this.handleThreadDeletion);
      client.removeListener('guildDelete', this.handleGuildDeletion);
      client.decrementMaxListeners();
    });
  }

  handleChannelDeletion(channel: Eris.TextableChannel) {
    if (
      channel.id === this.message.channel.id ||
      ('parentID' in this.message.channel && channel.id === this.message.channel.parentID)
    ) {
      this.stop('channelDelete');
    }
  }

  handleThreadDeletion(thread: Eris.ThreadChannel) {
    if (thread.id === this.message.channel.id) {
      this.stop('threadDelete');
    }
  }

  handleGuildDeletion(guild: Eris.Guild) {
    if ('guild' in this.message.channel && guild.id === this.message.channel.guild.id) {
      this.stop('guildDelete');
    }
  }

  handleMessageDeletion(message: Eris.Message) {
    if (message.id === this.message.id) {
      this.stop('messageDelete');
    }
  }

  async handleReaction(message: Eris.Message, reaction: Eris.PartialEmoji, user: Eris.PartialUser) {
    if (message.id === this.message.id) {
      const u = await client.ch.getUser(user.id);

      this.emit('collect', reaction, u);
    }
  }

  stop(reason?: string) {
    if (this.ended) return;
    this.ended = true;
    this.emit('end', reason);
  }
}

export default MessageCollector;
