const mongoose = require('mongoose');
const mock = require('mock-require');

mongoose.Promise = Promise;

describe('Gift schema', () => {
  let Gift;
  let updateDocumentUtil;
  let _giftDefinition;

  beforeEach(() => {
    _giftDefinition = {
      name: 'Foo',
      budget: 1
    };
    updateDocumentUtil = mock.reRequire('../utils/update-document');
    spyOn(updateDocumentUtil, 'updateDocument').and.returnValue();
    spyOn(console, 'log').and.returnValue();
    Gift = mongoose.model('Gift', mock.reRequire('./gift'));
  });

  afterEach(() => {
    delete mongoose.models.Gift;
    delete mongoose.modelSchemas.Gift;
    mock.stopAll();
  });

  it('should add a wish list record', () => {
    let gift = new Gift(_giftDefinition);
    const err = gift.validateSync();
    expect(err).toBeUndefined();
  });

  it('should trim the name', () => {
    _giftDefinition.name = '   foo ';
    let gift = new Gift(_giftDefinition);
    const err = gift.validateSync();
    expect(err).toBeUndefined();
    expect(gift.name).toEqual('foo');
  });

  it('should be invalid if name is undefined', () => {
    _giftDefinition.name = undefined;
    let gift = new Gift(_giftDefinition);
    const err = gift.validateSync();
    expect(err.errors.name.properties.type).toEqual('required');
  });

  it('should be invalid if name is too long', () => {
    let name = '';
    for (let i = 0, len = 251; i < len; ++i) {
      name += 'a';
    }

    _giftDefinition.name = name;
    let gift = new Gift(_giftDefinition);
    const err = gift.validateSync();
    expect(err.errors.name.properties.type).toEqual('maxlength');
  });

  it('should be invalid if budget is less than zero', () => {
    _giftDefinition.budget = -1;
    let gift = new Gift(_giftDefinition);
    const err = gift.validateSync();
    expect(err.errors.budget.properties.type).toEqual('min');
  });

  it('should be invalid if budget is greater than 1 trillion', () => {
    _giftDefinition.budget = 111111111111111;
    let gift = new Gift(_giftDefinition);
    const err = gift.validateSync();
    expect(err.errors.budget.properties.type).toEqual('max');
  });

  it('should generate timestamps automatically', () => {
    expect(Gift.schema.paths.dateCreated).toBeDefined();
    expect(Gift.schema.paths.dateUpdated).toBeDefined();
  });

  it('should beautify native mongo errors', () => {
    let found = Gift.schema.plugins.filter(plugin => {
      return (plugin.fn.name === 'MongoDbErrorHandlerPlugin');
    })[0];
    expect(found).toBeDefined();
  });

  it('should update certain fields', () => {
    const gift = new Gift(_giftDefinition);
    const formData = {};

    gift.update(formData);

    expect(updateDocumentUtil.updateDocument).toHaveBeenCalledWith(
      gift,
      [ 'budget', 'isReceived', 'name' ],
      formData
    );
  });
});
