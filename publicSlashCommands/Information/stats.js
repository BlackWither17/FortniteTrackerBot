import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
} from "discord.js";
import logger from "../../functions/logger.js";
import superagent from "superagent";

export default {
  name: "stats",
  description: "Shows you the account stats of a specific account",
  cooldown: 3000,
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "name",
      description: "The name of the player",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  integration_types: [0, 1],
  contexts: [0, 1, 2],
  run: async (client, interaction) => {
    const accountName = interaction.options.getString("name");
    await interaction.deferReply();

    try {
      const res = await superagent
        .get("https://fortnite-api.com/v2/stats/br/v2")
        .query({ name: accountName, image: "all" })
        .set("Authorization", process.env.FORTNITE_API_TOKEN);

      const imageUrl = res.body?.data?.image;
      if (!imageUrl) {
        return interaction.editReply({
          content: "Für diesen Account wurde kein Stats-Bild gefunden.",
        });
      }

      const container = new ContainerBuilder().addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder()
            .setDescription("Banner")
            .setURL(imageUrl),
        ),
      );

      return interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (err) {
      logger.error(err);

      const message =
          err.status === 404
            ? `Spieler **${accountName}** wurde nicht gefunden.`
            : err.status === 403
              ? "Die Stats dieses Accounts sind privat."
              : "Beim Abrufen der Stats ist ein Fehler aufgetreten.";

      return interaction.editReply({ content: message });
    }
  },
};
