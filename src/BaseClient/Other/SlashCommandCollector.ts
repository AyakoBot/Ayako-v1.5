import { EventEmitter } from 'events';
import type Eris from 'eris';
import client from '../ErisClient';

class SlashCommandCollector extends EventEmitter {
  ended: boolean;
  time: number;
  channel: Eris.TextableChannel;
  recieved: number;

  constructor(channel: Eris.TextableChannel, time?: number) {
    super();
    this.channel = channel;
    this.time = time || 60000;
    this.ended = false;
    this.recieved = 0;

    this.handleSlashCommand = this.handleSlashCommand.bind(this);
    this.handleChannelDeletion = this.handleChannelDeletion.bind(this);
    this.handleThreadDeletion = this.handleThreadDeletion.bind(this);
    this.handleGuildDeletion = this.handleGuildDeletion.bind(this);

    setTimeout(() => this.stop('time'), this.time);

    client.incrementMaxListeners();
    client.on('interactionCreate', this.handleSlashCommand);
    client.on('channelDelete', this.handleChannelDeletion);
    client.on('threadDelete', this.handleThreadDeletion);
    client.on('guildDelete', this.handleGuildDeletion);

    this.once('end', () => {
      client.removeListener('interactionCreate', this.handleSlashCommand);
      client.removeListener('channelDelete', this.handleChannelDeletion);
      client.removeListener('threadDelete', this.handleThreadDeletion);
      client.removeListener('guildDelete', this.handleGuildDeletion);
      client.decrementMaxListeners();
    });
  }

  handleChannelDeletion(channel: Eris.TextableChannel) {
    if (
      channel.id === this.channel.id ||
      ('parentID' in this.channel && channel.id === this.channel.parentID)
    ) {
      this.stop('channelDelete');
    }
  }

  handleThreadDeletion(thread: Eris.ThreadChannel) {
    if (thread.id === this.channel.id) {
      this.stop('threadDelete');
    }
  }

  handleGuildDeletion(guild: Eris.Guild) {
    if ('guild' in this.channel && guild.id === this.channel.guild.id) {
      this.stop('guildDelete');
    }
  }

  handleSlashCommand(interaction: Eris.CommandInteraction) {
    if (interaction.type !== 2) return;
    if (interaction.channel.id === this.channel.id) {
      this.emit('collect', interaction);
    }
  }

  stop(reason?: string) {
    if (this.ended) return;
    this.ended = true;
    this.emit('end', reason);
  }
}

export default SlashCommandCollector;
