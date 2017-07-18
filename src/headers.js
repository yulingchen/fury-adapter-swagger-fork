import link from './link';
import annotations from './annotations';

export function createHeaders(payload, parser) {
  const {HttpHeaders} = parser.minim.elements;

  const headers = new HttpHeaders();

  payload.headers = payload.headers || headers;
}

export function pushHeader(key, value, payload, parser, fragment) {
  const {Member: MemberElement} = parser.minim.elements;
  let header;

  createHeaders(payload, parser);

  const duplicate = payload.headers.find((member) => {
    return member.key.content.toLowerCase() === key.toLowerCase();
  });

  if (duplicate.length) {
    header = duplicate.first();
    header.value = value;
  } else {
    header = new MemberElement(key, value);
  }

  if (fragment) {
    link.inferred(fragment, header, parser);
  } else {
    header._meta = parser.minim.toElement({});
  }

  if (fragment === undefined && parser.generateSourceMap) {
    parser.createSourceMap(header, parser.path);
  }

  if (!duplicate.length) {
    payload.headers.push(header);
  }

  return header;
}

export function pushHeaderObject(key, header, payload, parser) {
  let value = '';

  if (header.type === 'array') {
    parser.createAnnotation(annotations.DATA_LOST, parser.path,
      'Headers of type array are not yet supported');

    return;
  }

  // Choose the first available option
  if (header.enum) {
    // TODO: This may lose data if there are multiple enums.
    value = header.enum[0];
  }

  if (header.default) {
    value = header.default;
  }

  const headerElement = pushHeader(key, value, payload, parser);

  if (header.description) {
    headerElement.description = header.description;

    if (parser.generateSourceMap) {
      parser.createSourceMap(headerElement.meta.get('description'), parser.path.concat(['description']));
    }
  }
}

export default {pushHeader, pushHeaderObject};
