import { QUEUES } from '../../constants';
import Dot from './Dot';

export default function QDot({ qid, size = 7 }) {
  const q = QUEUES.find((x) => x.id === qid);
  return <Dot hex={q ? q.color : '#888'} size={size} />;
}
