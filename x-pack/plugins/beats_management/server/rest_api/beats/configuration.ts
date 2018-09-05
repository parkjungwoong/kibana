/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import Joi from 'joi';
import { BeatTag, ConfigurationBlock } from '../../../common/domain_types';
import { CMServerLibs } from '../../lib/lib';
import { wrapEsError } from '../../utils/error_wrappers';

export const createGetBeatConfigurationRoute = (libs: CMServerLibs) => ({
  method: 'GET',
  path: '/api/beats/agent/{beatId}/configuration',
  config: {
    validate: {
      headers: Joi.object({
        'kbn-beats-access-token': Joi.string().required(),
      }).options({ allowUnknown: true }),
    },
    auth: false,
  },
  handler: async (request: any, reply: any) => {
    const beatId = request.params.beatId;
    const accessToken = request.headers['kbn-beats-access-token'];

    let beat;
    let tags;
    try {
      beat = await libs.beats.getById(libs.framework.internalUser, beatId);
      if (beat === null) {
        return reply({ message: `Beat "${beatId}" not found` }).code(404);
      }

      const isAccessTokenValid = beat.access_token === accessToken;
      if (!isAccessTokenValid) {
        return reply({ message: 'Invalid access token' }).code(401);
      }

      tags = await libs.tags.getTagsWithIds(libs.framework.internalUser, beat.tags || []);
    } catch (err) {
      return reply(wrapEsError(err));
    }

    const configurationBlocks = tags.reduce((blocks: ConfigurationBlock[], tag: BeatTag) => {
      blocks = blocks.concat(tag.configuration_blocks);
      return blocks;
    }, []);

    reply({
      configuration_blocks: configurationBlocks,
    });
  },
});
