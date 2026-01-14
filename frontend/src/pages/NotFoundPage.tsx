import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { FiHome } from 'react-icons/fi';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="text-3xl font-semibold text-gray-900 mt-4">
          Страница не найдена
        </h2>
        <p className="text-gray-600 mt-2 mb-8">
          Запрашиваемая страница не существует.
        </p>
        <Link to="/">
          <Button variant="primary">
            <FiHome className="inline mr-2" />
            На главную
          </Button>
        </Link>
      </div>
    </div>
  );
};












