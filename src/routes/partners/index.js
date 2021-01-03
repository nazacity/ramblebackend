'use strict';

const Joi = require('joi');
const express = require('express');
const router = express.Router();

const { standardize } = require('../../utils/request');
const { PartnerService, ActivityService } = require('../../services');

const editPartner = standardize(async (req, res) => {
  const schema = Joi.object({
    permission: Joi.string(),
  });
  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });

  const user = Joi.attempt(req.body, schema);
  const { id } = Joi.attempt(req.params, paramSchema);
  res.json(await PartnerService.edit(id, user));
});

const editActivity = standardize(async (req, res) => {
  let schema;
  const request = { ...req.body };
  delete request.type;
  if (req.body.type === 'banner') {
    schema = Joi.object({
      activity_picture_url: Joi.string().required(),
    });
  } else if (req.body.type === 'title') {
    schema = Joi.object({
      title: Joi.string().required(),
      sub_title: Joi.string().required(),
      description: Joi.string().required(),
    });
  } else if (req.body.type === 'location') {
    schema = Joi.object({
      location: {
        lat: Joi.number().required(),
        lng: Joi.number().required(),
        province: Joi.string().required(),
        place_name: Joi.string().required(),
      },
    });
  } else if (req.body.type === 'dateinfo') {
    schema = Joi.object({
      actual_date: Joi.date().required(),
      register_start_date: Joi.date().required(),
      register_end_date: Joi.date().required(),
    });
  } else if (req.body.type === 'courses') {
    schema = Joi.object({
      courses: Joi.array().items({
        id: Joi.string().required(),
        title: Joi.string().required(),
        range: Joi.number().required(),
        price: Joi.number().required(),
        course_picture_url: Joi.string().required(),
      }),
    });
  } else if (req.body.type === 'timeline') {
    schema = Joi.object({
      timeline: Joi.array().items({
        id: Joi.string().required(),
        time: Joi.string().required(),
        title: Joi.string().required(),
        description: Joi.string().allow(''),
      }),
    });
  } else if (req.body.type === 'gifts') {
    schema = Joi.object({
      gifts: Joi.array().items({
        id: Joi.string(),
        description: Joi.string().allow(''),
        gift_picture_url: Joi.string().allow(''),
      }),
    });
  } else if (req.body.type === 'shirt_detail') {
    schema = Joi.object({
      shirt_detail: Joi.array().items({
        id: Joi.string().required(),
        style: Joi.string().required(),
        shirt_picturl_url: Joi.string().required(),
      }),
    });
  } else if (req.body.type === 'size') {
    schema = Joi.object({
      size: Joi.array().items({
        id: Joi.string().required(),
        size: Joi.string().required(),
        description: Joi.string().allow(''),
      }),
    });
  } else if (req.body.type === 'rules') {
    schema = Joi.object({
      rules: Joi.array().items({
        id: Joi.string().required(),
        title: Joi.string().required(),
        detail: Joi.array().items({
          id: Joi.string().allow(''),
          description: Joi.string().allow(''),
        }),
      }),
    });
  } else if (req.body.type === 'rules1') {
    schema = Joi.object({
      rules1: Joi.string().required(),
    });
  } else if (req.body.type === 'more_detail') {
    schema = Joi.object({
      more_detail: Joi.string().required(),
    });
  } else if (req.body.type === 'condition') {
    schema = Joi.object({
      condition: Joi.string().required(),
    });
  } else if (req.body.type === 'coupons') {
    schema = Joi.object({
      coupons: Joi.array().items({
        description: Joi.string().required(),
        coupon_picture_url: Joi.string().required(),
      }),
    });
  }

  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });

  const data = Joi.attempt(request, schema);
  const { id } = Joi.attempt(req.params, paramSchema);

  res
    .status(200)
    .send({ status: 200, data: await ActivityService.editActivity(id, data) });
});

const getPartnerByJwt = standardize(async (req, res) => {
  return res.json(req.user);
});

const userActivities = standardize(async (req, res) => {
  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });

  const { id } = Joi.attempt(req.params, paramSchema);

  res.json({ status: 200, data: await ActivityService.getUserActivities(id) });
});

router.get('/getpartnerbyjwt', getPartnerByJwt);
router.post('/editpartner/:id', editPartner);
router.post('/editactivity/:id', editActivity);
router.get('/useractivities/:id', userActivities);

module.exports = router;
