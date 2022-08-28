import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { Header } from './Header';
import AuthContext from '../contexts/AuthContext';

interface PageContainerProps {
  children: React.ReactNode;
}

const MainContainer = styled.div`
  padding: 10px;
`;

export const PageContainer = (props: PageContainerProps) => {
  const { children } = props;
  const { isAuthenticated } = React.useContext(AuthContext);
  const history = useHistory();
  useEffect(() => {
    if (!isAuthenticated) history.push('/');
  }, [isAuthenticated, history]);

  return (
    <MainContainer>
      <Header></Header>
      {children}
    </MainContainer>
  );
};
