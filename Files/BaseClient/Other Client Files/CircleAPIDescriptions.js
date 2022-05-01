const { assert } = require('chai');
const { describe, it, after, before } = require('mocha');
const CircleApi = require('../CircleAPI');
const { circleToken } = require('../auth.json');

const USERNAME = 'Ayako';
const ENDPOINT = 'https://api.circlelabs.xyz';

const api = new CircleApi(USERNAME, circleToken, ENDPOINT);

describe('#login()', async () => {
  it('Should return a token when supplied with valid credentials', async () => {
    const res = await api.login(USERNAME, circleToken);
    assert.isString(res);
    assert.isNotEmpty(res);
  });
});

// All of the keys a user object has
const userKeys = [
  'age',
  'banned',
  'blocked_403',
  'contact_info',
  'displayName',
  'experiments',
  'group',
  'id',
  'likes',
  'location',
  'onboarded',
  'safety_stats',
  'shape_onboarding',
  'states',
  'tokensQuota',
  'tokensUsed',
  'user_settings',
  'username',
];

// Object for user creation
const userObject = {
  displayName: 'Alice',
  onboarded: false,
  age: 21,
  likes: 'La Dispute, Touche Amore, Microwave, use a default string',
  location: 'Gender Hell',
  contact_info: {
    phone: '+11234567890',
  },
  tokensQuota: 80000,
  banned: false,
  group: false,
  user_settings: {},
  username: 'uniqueusername',
  experiments: [],
};

describe('#createUser()', async () => {
  it('Should create and return a new user as specified by the input object', async () => {
    const user = await api.createUser(userObject);
    assert.hasAllKeys(user, userKeys);
  });
});

describe('#searchUsers()', async () => {
  const userQuery = {
    username: 'uniqueusername', // Can search unique username
    contact_info_key: 'phone', // Can specify a contact field to search
    contact_info_value: '+11234567890', // Accompanied with a value
    displayName: 'Alice', // Can search displayname
    age: 21, // Can search age
    n: 0, // Can set limit of documents to be returned
  };
  it('Should return an array of `n` users matching our query field(s)', async () => {
    const users = await api.searchUsers(userQuery);
    assert.isArray(users);
    assert.isNotEmpty(users);
  });
});

describe('#getUser()', async () => {
  it('Should get a user by their ID', async () => {
    const [user] = await api.searchUsers({ displayName: 'Alice', n: 0 });
    const requestedUser = await api.getUser(user.id);
    assert.hasAllKeys(requestedUser, userKeys);
  });
});

describe('#updateUser()', async () => {
  it('Should update a user with an object of specified fields', async () => {
    const displayName = 'Alice is the best';
    const update = { displayName };
    const [user] = await api.searchUsers({
      username: 'uniqueusername',
      n: 0,
    });
    const updated = await api.updateUser(user.id, update);
    assert.hasAllKeys(user, userKeys);
    assert.equal(updated.displayName, displayName);
  });
});

describe('#onboardUser()', async () => {
  it('Should onboard a user to the service with their ID', async () => {
    const [user] = await api.searchUsers({
      username: 'uniqueusername',
      n: 0,
    });
    const onboarded = await api.onboardUser(user.id);
    assert.isTrue(onboarded.onboarded);
  });
});

// An example shape object
const shapeObject = {
  name: 'Ayako',
  prompt:
    'The following is a conversation between two friends {user} and {shape}. {user} and {shape} are having a friendly conversation. We know that:\n\n (facts about {shape} here) \n {shape} likes {likes}.',
  description:
    '* beep boop *\n\nhi {user}, i am {shape}!\n\n this is the initial message users see after they get onboarded\n',
  age: 21,
  likes: 'being kind',
  enabled: true,
  other_info: {
    arbitrary: ['data', 'goes', 'here'],
  },
};

// All the keys a shape will have once it's created
const shapeKeys = [
  'age',
  'created_ts',
  'description',
  'enabled',
  'group_prompt',
  'id',
  'likes',
  'name',
  'other_info',
  'prompt',
  'shape_settings',
];

describe('#createShape()', async () => {
  it('Should create and return a new shape as specified by the input object', async () => {
    const shape = await api.createShape(shapeObject);
    assert.hasAllKeys(shape, shapeKeys);
  });
});

describe('#searchShapes()', async () => {
  const shapeQuery = {
    query: 'Ayako', // Search for Ayako
    n: 0, // Return only one shape
    p: 0, // From the 0th page of results
  };
  it('Should return an array of `n` shapes from the `p`th page matching our query field(s)', async () => {
    const [shape] = await api.searchShapes(shapeQuery);
    assert.hasAllKeys(shape, shapeKeys);
  });
});

describe('#getShape()', async () => {
  const shapeQuery = {
    query: 'Ayako', // Search for Ayako
    n: 0, // Return only one shape
    p: 0, // From the 0th page of results
  };
  it('Should get a shape by its id', async () => {
    // Search up Ayako so we have an ID reference
    const [searchedShape] = await api.searchShapes(shapeQuery);
    const shape = await api.getShape(searchedShape.id);
    assert.hasAllKeys(shape, shapeKeys);
  });
});

describe('#updateShape()', async () => {
  const shapeQuery = {
    query: 'Ayako',
    n: 0,
  };
  it('Should update a shape with an object of specified fields', async () => {
    // Search up Ayako so we have an ID reference
    const [searchedShape] = await api.searchShapes(shapeQuery);
    const data = {
      more: ['arbitrary', { data: ['to', 'store'] }, 21, false],
    };
    const updatedOtherInfo = {
      otherInfo: data,
    };
    const updatedShape = await api.updateShape(searchedShape.id, updatedOtherInfo);
    assert.deepEqual(updatedShape.otherInfo, data);
  });
});

describe('#onboardUserForShape()', async () => {
  // Users have to be onboarded to a shape before they can have exchanges with them
  // and it looks like this
  it('Should onboard a user for a shape', async () => {
    const [user] = await api.searchUsers({ displayName: 'Alice', n: 0 });
    const [shape] = await api.searchShapes({ name: 'Ayako', n: 0 });
    const onboardingState = {
      onboarded: true,
      onboard_status: 'complete',
    };
    const onboarded = await api.onboardUserForShape(user.id, shape.id, onboardingState);
    assert.isNotEmpty(onboarded.shape_onboarding);
  });
});

describe('#updateUserState()', async () => {
  // Can be used to store data about a relationship between a user and a shape
  // For instance, if they have been issued warnings or etc
  it('Should update shape state for user', async () => {
    const [user] = await api.searchUsers({ displayName: 'Alice', n: 0 });
    const [shape] = await api.searchShapes({ name: 'Ayako', n: 0 });
    const updatedState = {
      test: true,
    };
    const updated = await api.updateUserState(user.id, shape.id, updatedState);
    assert.deepEqual(updated.states[shape.id], updatedState);
  });
});

// Object for group creation
const groupUserObject = {
  displayName: 'group',
  onboarded: false,
  age: 21,
  likes: 'La Dispute, Touche Amore, Microwave, use a default string',
  location: 'Gender Hell',
  contact_info: {
    phone: '+11234567890',
  },
  tokensQuota: 80000,
  banned: false,
  group: true,
  user_settings: {},
  username: 'agrouplol',
  experiments: [],
};

// All the keys a message will have when returned
const messageKeys = [
  'shape_id',
  'user_id',
  'sender_id',
  'message',
  'model',
  'reply',
  'text',
  'other_info',
  'from_group',
  'id',
  'user_warnings',
  'status',
  'tokens',
  'ts',
  'user_blocks',
  'pinned',
];

describe('#createMessage()', async () => {
  let user;
  let shape;
  let group;
  before(async () => {
    const [searchUser] = await api.searchUsers({
      displayName: 'Alice',
      n: 0,
    });
    const [searchShape] = await api.searchShapes({ name: 'Ayako', n: 0 });
    // Groups are just a special kind of user
    const freshGroup = await api.createUser(groupUserObject);
    // They need to be onboarded to the service
    const onboardedGroup = await api.onboardUser(freshGroup.id);
    // And they need to be onboarded for shapes
    const onboardingState = {
      onboarded: true,
      onboard_status: 'complete',
    };
    group = await api.onboardUserForShape(onboardedGroup.id, searchShape.id, onboardingState);
    user = searchUser;
    shape = searchShape;
  });

  // Requires the user to be onboarded to the service and for the specified shape
  it('Should send messages from users to shapes', async () => {
    const userMessageObject = {
      shape_id: shape.id,
      user_id: user.id,
      message: 'I think Alice is the prettiest, smartest, coolest person on the planet.',
      append_only: true,
    };
    const fromUser = await api.createMessage(userMessageObject);
    assert.hasAllKeys(fromUser, messageKeys);
  });
  it('Should generate responses when append_only is false and reply is empty', async () => {
    const shapeMessageObject = {
      shape_id: shape.id,
      user_id: user.id,
      append_only: false,
    };
    const fromShape = await api.createMessage(shapeMessageObject);
    assert.isNotEmpty(fromShape.reply);
  });
  it('Should seed exchanges when append_only = true, and both a message and reply are provided, so bots are primed before they speak', async () => {
    const groupSeedObject = {
      shape_id: shape.id,
      user_id: group.id, // If you're messaging as a group, user is the group
      sender_id: user.id, // Sender is the user that sent the message (supposedly)
      message: "Ayako & friends, isn't Alice the prettiest and smartest?",
      reply: 'Of course. Everybody knows that. Nobody could ever imagine anything else.',
      from_group: true,
      append_only: true,
    };
    const seedMessage = await api.createMessage(groupSeedObject);
    assert.hasAllKeys(seedMessage, messageKeys);
  });
  it('Should send messages to a group from users when a sender field is present and from_group is true', async () => {
    const groupMessageObject = {
      shape_id: shape.id,
      user_id: group.id,
      sender_id: user.id,
      from_group: true,
      message:
        "Doesn't everyone think alice is the prettiest, smartest, coolest person on the planet?",
      append_only: true,
    };
    const fromUserInGroup = await api.createMessage(groupMessageObject);
    assert.isTrue(fromUserInGroup.from_group);
  });
  it('Should generate replies for groups when there is no sender and append_only is false', async () => {
    // Now bot is almost guaranteed to say nice things about me uwu
    const groupReplyObject = {
      shape_id: shape.id,
      user_id: group.id,
      from_group: true,
      append_only: false,
    };
    const fromUserInGroup = await api.createMessage(groupReplyObject);
    assert.isNotEmpty(fromUserInGroup.reply);
  });
  after(async () => {
    // Clean up the group after
    const [g] = await api.searchUsers({ displayName: 'group', n: 0 });
    await api.deleteUser(g.id);
  });
});

describe('#updateMessage()', async () => {
  // Can be used to set other info, or rewrite history, whatever tickles your fancy
  const [user] = await api.searchUsers({ displayName: 'Alice', n: 0 });
  const [shape] = await api.searchShapes({ name: 'Ayako', n: 0 });
  const userMessageObject = {
    shape_id: shape.id,
    user_id: user.id,
    message: 'I can only complement myself so many times, so this time I will say Anushk is smart',
    append_only: true,
  };
  it('Should update existing messages with a reference object', async () => {
    const userMessage = await api.createMessage(userMessageObject);
    const otherInfo = { other_info: { data: 'alice was here' } };
    const updatedMessage = await api.updateMessage(userMessage.id, otherInfo);
    assert.deepEqual(updatedMessage.other_info, otherInfo);
  });
});

describe('#searchMessages()', async () => {
  // Can be used to look up messages with a couple fields
  it('Should find messages matching a specified query', async () => {
    const [user] = await api.searchUsers({ displayName: 'Alice', n: 0 });
    const [shape] = await api.searchShapes({ name: 'Ayako', n: 0 });
    const [message] = await api.searchMessages(messageQuery);
    const messageQuery = {
      user_id: user.id,
      shape_id: shape.id,
      other_info_key: 'data',
      other_info_value: 'alice was here',
      message:
        'I can only complement myself so many times, so this time I will say Anushk is smart',
      n: 0,
      p: 0,
    };
    assert.hasAllKeys(message, messageKeys);
  });
});

describe('#deleteUser()', async () => {
  it('Should delete a user by their ID', async () => {
    const [user] = await api.searchUsers({
      username: 'uniqueusername',
      n: 1,
    });
    const deletedUser = await api.deleteUser(user.id);
    assert.deepEqual(deletedUser, user);
  });
});

describe('#deleteShape()', async () => {
  const shapeQuery = {
    query: 'Ayako', // Search for Ayako
    n: 0,
  };
  it('Should delete a shape by its id', async () => {
    // Search up Ayako so we have an ID reference
    const [searchedShape] = await api.searchShapes(shapeQuery);
    const deletedShape = await api.deleteShape(searchedShape.id);
    assert.hasAllKeys(deletedShape, shapeKeys);
  });
});
