import { describe, it } from 'node:test'
import assert from 'node:assert'

import parseLinkHeader from './index'

describe('parseLinkHeader', () => {
  it('should parse header', () => {
    const url = 'http://example.com/some-path/?foo=bar&page=2'
    const header = `<${url}>; rel="next", <${url}>; rel="last"`
    const expected = {
      foo: 'bar',
      page: '2',
      url,
    }
    assert.deepEqual(parseLinkHeader(header), {
      next: { ...expected, rel: 'next' },
      last: { ...expected, rel: 'last' },
    })
  })
})
