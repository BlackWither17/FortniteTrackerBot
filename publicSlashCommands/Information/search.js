import {ApplicationCommandType, EmbedBuilder, PermissionFlagsBits, TextInputStyle} from "discord.js";
import superagent from "superagent";
import logger from "../../functions/logger.js";

const rarityColors = {
  "common": "#c7c7c7",
  "uncommon": "#77cc77",
  "rare": "#7777cc",
  "epic": "#9d4dbb",
  "legendary": "#f3af19",
  "exotic": "#7393b3",
};

export default {
  name: "search",
  description: "Search for a specific cosmetic",
  cooldown: 3000,
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "name",
      description: "Name of the cosmetic",
      type: 3,
      required: true,
    },
    {
      name: "type",
      description: "Type of the cosmetic",
      type: 3,
      required: false,
    },
  ],
  integration_types: [0, 1],
  contexts: [0,1,2],
  run: async (client, interaction) => {
    const cosmeticName = interaction.options.getString("name");
    const cosmeticType = interaction.options.getString("type");
    await interaction.deferReply();

    await superagent
      .get("https://fortnite-api.com/v2/cosmetics")
      .end(async (err, result) => {
        if (err) {
          logger.error(err);
        }

        const cosmetic = result.body.data.br.find(cosmetic => cosmetic.name.includes(cosmeticName) && (cosmeticType ? cosmetic.type.displayValue === cosmeticType : true));
        if (!cosmetic) {
          return interaction.editReply({ content: "Cosmetic could not be found." });
        }

        const embed = new EmbedBuilder()
          .setColor(rarityColors[cosmetic.rarity.value] ?? rarityColors.common)
          .setThumbnail(cosmetic.images.icon)
          .setImage(cosmetic.images.featured)
          .setDescription(
            `**Name:** \`${cosmetic.name}\`\n` +
            `**Description:** \`${cosmetic.description}\`\n` +
            `**Type:** \`${cosmetic.type.displayValue}\`\n` +
            `**Set:** \`${cosmetic.set.value}\`\n` +
            `**Introduction:** \`${cosmetic.introduction.text}\``,
          );

        return interaction.editReply({ embeds: [embed] });
      });
  },
};
