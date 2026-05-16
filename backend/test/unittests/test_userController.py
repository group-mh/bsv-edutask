import pytest
import unittest.mock as mock

from src.controllers.usercontroller import UserController


class TestUserController:
    """Unit tests for UserController.get_user_by_email using mocked DAO."""

    @pytest.fixture
    def mocked_dao(self):
        """Mock DAO to isolate UserController from database."""
        return mock.MagicMock()

    @pytest.fixture
    def sut(self, mocked_dao):
        """System under test (get_user_by_email) with amocked DAO"""
        return UserController(mocked_dao)

    def test_single_user(self, sut, mocked_dao):
        """Test case # 1: Valid email returns single user."""
        user = {'email': 'test@email.com'}
        mocked_dao.find.return_value = [user]

        result = sut.get_user_by_email("test@email.com")

        assert result == user


    def test_multiple_users(self, sut, mocked_dao, capsys):
        """Test Case # 2:  multiple users returns first user and prints warning."""
        user1 = {'email': 'mats@email.com'}
        user2 = {'email': 'hassan@email.com'}

        mocked_dao.find.return_value = [user1, user2]

        result = sut.get_user_by_email("mats@email.com")
        captured = capsys.readouterr()

        assert result == user1
        assert "more than one user found" in captured.out


    # def test_no_users(self, sut, mocked_dao):
    #     """Test Case # 3: No users found returns None"""
    #     mocked_dao.find.return_value = []

    #     result = sut.get_user_by_email("test@email.com")

    #     assert result is None

    def test_missing_at(self, sut):
        """Test Case # 4: missing '@' should raise ValueError."""
        with pytest.raises(ValueError):
            sut.get_user_by_email("testexample.com")

    # def test_multiple_at(self, sut):
    #     """Test Case # 5: multiple '@@' should raise ValueError."""

    #     with pytest.raises(ValueError):
    #         sut.get_user_by_email("test@@example.com")

    # def test_missing_dot(self, sut):
    #     """Test Case # 6: missing domain dot should raise ValueError."""

    #     with pytest.raises(ValueError):
    #         sut.get_user_by_email("test@examplecom")


    def test_dao_exception(self, sut, mocked_dao):
        """Test Case # 7: DAO failure propagates exception."""
        mocked_dao.find.side_effect = Exception("DB error")

        with pytest.raises(Exception):
            sut.get_user_by_email("test@example.com")
