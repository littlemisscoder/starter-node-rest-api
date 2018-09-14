const sinon = require('sinon');
const mongoose = require('mongoose');

describe('User ', () => {
  it('should create a mongoose model', () => {
    // Given
    const expectedDefinition = {
      username: {
        type: String,
        unique: true,
        required: true,
      },
      password: {
        type: String,
        required: true,
      },
    };
    const expectedOptions = {
      collection: 'users',
    };
    const expectedName = 'User';
    const expectedSchema = { test: 'test' };

    // Schema setup
    let defintion;
    let options;
    sinon.stub(mongoose, 'Schema').callsFake((d, o) => {
      defintion = d;
      options = o;
      return expectedSchema;
    });

    // Model setup
    const model = {};
    let name;
    let schema;
    sinon.stub(mongoose, 'model').callsFake((n, s) => {
      name = n;
      schema = s;
      return model;
    });

    // When
    const user = require('./User'); // eslint-disable-line global-require

    // Then
    expect(user).toBe(model);
    expect(defintion).toEqual(expectedDefinition);
    expect(options).toEqual(expectedOptions);
    expect(name).toEqual(expectedName);
    expect(schema).toEqual(expectedSchema);
  });
});
