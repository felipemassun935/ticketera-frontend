import { useAdmin } from '../../context/AdminContext';
import Dot from './Dot';

export default function QDot({ qid, size = 7 }) {
  const { queues } = useAdmin();
  const q = queues.find(x => x.id === qid);
  return <Dot hex={q ? q.color : '#888'} size={size} />;
}
