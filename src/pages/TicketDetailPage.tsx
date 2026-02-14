import { useParams } from 'react-router';

const TicketDetailPage = () => {
  const { id } = useParams();
  return <div>TicketDetailPage {id}</div>;
};

export default TicketDetailPage;
