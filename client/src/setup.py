import os
from setuptools import find_packages, setup

with open(os.path.join(os.path.dirname(__file__), "README.md")) as readme:
    README = readme.read()

# allow setup.py to be run from any path
os.chdir(os.path.normpath(os.path.join(os.path.abspath(__file__), os.pardir)))

setup(
    name="jsx-service-client",
    version="0.9.5",
    packages=find_packages(),
    include_package_data=True,
    license="MIT License",  # example license
    description="An helper lib that makes call to the jsx-service in order to generate html from jsx files",
    long_description=README,
    url="https://github.com/gbozee/jsx-service",
    author="Biola Oyeniyi",
    author_email="b33sama@gmail.com",
    install_requires=[
        "requests",
        "future",
        "Paperboy",
        "python-dateutil",
        # "requests-async",
    ],
    # dependency_links=[
        # "http://github.com/SergeySatskiy/cdm-pythonparser/archive/v2.0.1.tar.gz"
    # ],
    classifiers=[
        "Environment :: Web Environment",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: BSD License",  # example license
        "Operating System :: OS Independent",
        "Programming Language :: Python",
        # Replace these appropriately if you are stuck on Python 2.
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 2",
        "Topic :: Internet :: WWW/HTTP",
        "Topic :: Internet :: WWW/HTTP :: Dynamic Content",
    ],
)
