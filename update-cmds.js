import { REST, SlashCommandBuilder, Routes } from 'discord.js';
import { styleText } from 'node:util';

/**
 * All of the bot's commands.
 * Forces people who run any of the commands to have the Ban Members permission.
 * Serializes the commands for the Discord API.
*/
const cmds = [
	new SlashCommandBuilder().setName('imprison').setDescription('Sends a user to prison').addUserOption(o=>o.setName('evildoer').setDescription('The naughty person to imprison').setRequired(true)),
	new SlashCommandBuilder().setName('prisoners').setDescription('Lists users that have been imprisoned'),
	new SlashCommandBuilder().setName('release').setDescription('Releases a user from prison').addUserOption(o=>o.setName('prisoner').setDescription('The person to release from prison').setRequired(true)),
].map(c=>{return c.setDefaultMemberPermissions(4).toJSON()})

console.log(styleText(['yellow', 'bold'], 'Registering slash commands...'));
await new REST({ version: '10' }).setToken(process.env.BOT_TOKEN).put(Routes.applicationCommands(process.env.APPLICATION_ID), { body: cmds });
console.log(styleText(['green', 'bold'], 'Slash commands registered!'));