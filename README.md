# **e2e-web4ux**

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [**Setup**](#setup)
- [**Setup Env Variable**](#setup-env-variable)
- [**Run The Test**](#run-the-test)
- [**Show Test Report**](#show-test-report)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## **Setup**

1. For windows user, please use '**powershell**'. For mac or linux user, please use '**terminal**'.

2. Please make sure you're able to run node-js script.
   Use below command to validate.

    ```sh
    node -v
    ```

    If you don't install node-js, please use this [link](https://nodejs.org/en/download) to install it.

3. Please make sure you're able to execute git command.

    ```sh
    git --version
    ```

    If you don't install git, please use this [link](https://git-scm.com/downloads) to install it.

4. Download this repository.
    ```sh
    git clone https://github.com/dtsai720/e2e-web4ux.git
    cd e2e-web4ux
    ```
    Also, you can use below command to get current directory.
    ```sh
    pwd
    ```
5. Install dependencies.

    ```sh
    npm install
    ```

6. Rename file '.env.example' to '.env'

## **Setup Env Variable**

Edit file named '.env'.

1. **Change below variable to login.**

    ```sh
    Email='your email'
    Password='your password'
    ```

2. **Change domain name if needed.**

    ```sh
    Host='https://stage-backend-web4ux.azurewebsites.net'
    ExperimentHost='https://stage-web4ux.azurewebsites.net'
    ```

3. **Change resolution and calibrat for what you want.**

    ```sh
    Width=1920
    Height=1080
    Calibrate=4.125
    ```

4. **Change device count.**

    ```sh
    DeviceCount=2
    ```

5. **Change participant count.**

    ```sh
    ParticipantCount=12
    ```

## **Run The Test**

```sh
npx playwright test
```

## **Show Test Report**

```sh
npx playwright show-report
```
