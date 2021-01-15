'use strict';

module.exports = {
  activity_state: [
    'pre_register',
    'registering',
    'end_register',
    'actual_date',
    'finished',
    'cancel',
  ],
  user_activity_state: [
    'change_course_waiting_payment',
    'waiting_payment',
    'upcoming',
    'actual_date',
    'checked_in',
    'finished',
    'cancel',
    'not_finished',
    'history',
  ],
  user_post: ['finding', 'closing'],
  announcement_state: ['not_read', 'read'],
};
